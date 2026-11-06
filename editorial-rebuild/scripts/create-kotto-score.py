#!/usr/bin/env python3
"""Render the original Kotto Seen score without samples or external services.

Usage: python scripts/create-kotto-score.py [--duration 26] [--output path.wav]
Requires Python, NumPy and SciPy. The seeded arrangement and synthesis are
deterministic. Changing duration scales note positions and chord changes.
The result is 48 kHz stereo PCM16 with triangular dither and a silent ending.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt


RATE = 48_000
REFERENCE_DURATION = 26.0
SEED = 412027


def hz(midi: float) -> float:
    return 440.0 * 2.0 ** ((midi - 69.0) / 12.0)


def ease(value: np.ndarray) -> np.ndarray:
    """A sine-squared envelope with zero slope at each endpoint."""
    return np.sin(np.clip(value, 0.0, 1.0) * np.pi / 2.0) ** 2


def lowpass(signal: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, cutoff, fs=RATE, output="sos"), signal, axis=0)


def add_at(bus: np.ndarray, sound: np.ndarray, when: float) -> None:
    start = int(round(when * RATE))
    stop = min(len(bus), start + len(sound))
    if start < len(bus) and stop > start:
        bus[start:stop] += sound[: stop - start]


def stereo(signal: np.ndarray, pan: float) -> np.ndarray:
    angle = (pan + 1.0) * np.pi / 4.0
    return np.column_stack((signal * np.cos(angle), signal * np.sin(angle)))


def felt_note(midi: float, velocity: float, pan: float,
              rng: np.random.Generator) -> np.ndarray:
    """A restrained, damped string tone with a soft hammer and quiet duplex tail.

    Partial stretch, a nearly unison second string and short-lived high
    harmonics keep the struck sound from resembling a pure sine/beep.
    """
    length = 5.5
    t = np.arange(round(length * RATE), dtype=np.float64) / RATE
    frequency = hz(midi)
    voice = np.zeros_like(t)
    detune = 2.0 ** (-1.7 / 1200.0)
    amplitudes = (1.0, .27, .125, .048, .022, .012, .005)
    for partial, amplitude in enumerate(amplitudes, 1):
        stretch = np.sqrt(1.0 + .00012 * partial * partial)
        pitch = frequency * partial * stretch
        decay = np.exp(-t / (2.15 / partial ** .67))
        phase = rng.uniform(-.08, .08)
        string = (.76 * np.sin(2 * np.pi * pitch * t + phase)
                  + .24 * np.sin(2 * np.pi * pitch * detune * t - phase))
        voice += amplitude * string * decay
    hammer = lowpass(rng.standard_normal(len(t)), 1400)
    voice += hammer * .035 * np.exp(-t / .023)
    # Felt attacks stay rounded; higher notes naturally have shorter body.
    envelope = ease(t / .012) * ease((length - t) / .65)
    voice = lowpass(voice, 3900) * envelope * velocity
    return stereo(voice, pan)


def pad_chord(notes: tuple[int, ...], length: float, gain: float,
              pan: float, rng: np.random.Generator) -> np.ndarray:
    """Warm, softly voiced string/air pad, with no rhythmic pulsing."""
    t = np.arange(round(length * RATE), dtype=np.float64) / RATE
    result = np.zeros((len(t), 2), dtype=np.float64)
    attack = min(2.7, length * .32)
    release = min(3.4, length * .43)
    envelope = ease(t / attack) * ease((length - t) / release)
    for index, note in enumerate(notes):
        pitch = hz(note)
        phase = rng.uniform(0, 2 * np.pi)
        note_pan = np.clip(pan + (index / max(1, len(notes) - 1) - .5) * .55,
                           -.65, .65)
        voice = np.zeros_like(t)
        # Mostly fundamental; low-level harmonics give a warm material texture.
        for partial, amplitude in ((1, 1.0), (2, .095), (3, .039), (4, .012)):
            drift = .012 * np.sin(2 * np.pi * .041 * t + phase)
            voice += amplitude * (
                .5 * np.sin(2 * np.pi * pitch * partial * 2 ** (-2.6/1200) * t + phase + drift)
                + .5 * np.sin(2 * np.pi * pitch * partial * 2 ** (2.4/1200) * t + phase * .81 - drift)
            )
        swell = .94 + .06 * np.sin(2 * np.pi * .061 * t + phase)
        result += stereo(voice * envelope * swell * gain / len(notes), note_pan)
    return lowpass(result, 1500)


def bass_note(midi: int, length: float) -> np.ndarray:
    t = np.arange(round(length * RATE), dtype=np.float64) / RATE
    fundamental = np.sin(2 * np.pi * hz(midi) * t)
    warmth = .14 * np.sin(2 * np.pi * hz(midi) * 2 * t)
    envelope = ease(t / 1.0) * ease((length - t) / 2.4)
    return stereo((fundamental + warmth) * envelope * .028, 0)


def room(bus: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Short early reflections plus a darker diffuse stereo tail."""
    wet = np.zeros_like(bus)
    tail_length = round(3.6 * RATE)
    t = np.arange(tail_length, dtype=np.float64) / RATE
    for channel in range(2):
        impulse = lowpass(rng.standard_normal(tail_length), 2700)
        impulse *= np.exp(-t / .72) * ease(t / .09)
        impulse /= np.sqrt(np.sum(impulse * impulse))
        impulse *= .13
        # Asymmetric early reflections make space without ping-pong echoes.
        offsets = ((.043, .11), (.079, .065), (.137, .036))
        for delay, amplitude in offsets:
            impulse[round((delay + channel * .008) * RATE)] += amplitude
        predelay = round(.025 * RATE)
        impulse = np.pad(impulse, (predelay, 0))
        source = .78 * bus[:, channel] + .22 * bus[:, 1-channel]
        wet[:, channel] = fftconvolve(source, impulse, mode="full")[:len(bus)]
    return wet


def make_score(duration: float) -> tuple[np.ndarray, dict]:
    rng = np.random.default_rng(SEED)
    stretch = duration / REFERENCE_DURATION
    n = round(duration * RATE)
    pad = np.zeros((n, 2), dtype=np.float64)
    piano = np.zeros_like(pad)
    bass = np.zeros_like(pad)

    # Overlapping voicings. No drum grid, loop or melodic jingle is used.
    # A 65 bpm reference underlies the sparse phrasing, with human offsets.
    chords = [
        (0.00, 9.10, (50, 57, 61, 64, 66), .092, -.12),   # Dmaj9
        (5.85, 9.20, (47, 54, 57, 62),     .086,  .10),   # Bm7
        (11.90, 9.10, (43, 50, 54, 59),    .087, -.08),   # Gmaj7
        (18.00, 7.30, (45, 52, 59, 61),    .083,  .08),   # Aadd9
        (22.50, 3.50, (50, 57, 62, 64, 66), .064, 0.0),  # Dmaj9 resolve
    ]
    for start, length, notes, gain, pan in chords:
        add_at(pad, pad_chord(notes, length * stretch, gain, pan, rng), start * stretch)

    # Each tuple is time in seconds, MIDI note, intensity and stereo pan.
    notes = [
        (.62, 62, .105, -.22),
        (1.59, 69, .064, .16),
        (3.41, 76, .035, .29),
        (5.27, 66, .057, -.10),
        (7.28, 59, .080, -.20),
        (8.21, 66, .054, .13),
        (10.09, 69, .041, .25),
        (11.94, 74, .030, -.13),
        (13.46, 55, .077, -.20),
        (14.41, 62, .060, .08),
        (16.24, 66, .043, .22),
        (18.53, 59, .041, -.12),
        (19.00, 57, .069, -.20),
        (20.39, 64, .051, .12),
        (21.81, 71, .034, .23),
        (23.36, 62, .063, -.10),
        (23.43, 66, .032, .10),
        (23.52, 69, .026, .23),
    ]
    for start, note, intensity, pan in notes:
        add_at(piano, felt_note(note, intensity, pan, rng), start * stretch)
    for start, length, note in ((.2, 8.6, 38), (6.5, 8.7, 35),
                                (12.8, 8.2, 31), (18.9, 5.8, 33),
                                (23.1, 2.9, 38)):
        add_at(bass, bass_note(note, length * stretch), start * stretch)

    # Barely audible continuous air, not vinyl ticks or conspicuous sound FX.
    air = lowpass(rng.standard_normal((n, 2)), 2100)
    air -= lowpass(air, 700)
    air *= .00022
    dry = pad + piano + bass + air
    signal = dry + room(piano + pad * .55, rng) * .70
    # Remove subsonic bias without changing the quiet bass register.
    signal = sosfilt(butter(2, 28, btype="highpass", fs=RATE, output="sos"), signal, axis=0)
    time = np.arange(n) / RATE
    fade = ease(time / (.75 * stretch)) * ease((duration - time) / (2.35 * stretch))
    signal *= fade[:, None]

    # Loudness is intentionally understated; retain the attack/decay dynamics.
    rms = np.sqrt(np.mean(signal ** 2))
    gain = min(10 ** (-23.0/20) / max(rms, 1e-12),
               10 ** (-4.5/20) / max(np.max(np.abs(signal)), 1e-12))
    signal *= gain
    signal[:48] = 0
    signal[-480:] = 0
    peak = float(np.max(np.abs(signal)))
    rms = float(np.sqrt(np.mean(signal ** 2)))
    stats = {
        "duration_seconds": n / RATE,
        "sample_rate": RATE,
        "channels": 2,
        "encoding": "PCM signed 16-bit little-endian",
        "frames": n,
        "peak_dbfs": round(20 * np.log10(max(peak, 1e-12)), 3),
        "rms_dbfs": round(20 * np.log10(max(rms, 1e-12)), 3),
        "crest_factor_db": round(20 * np.log10(peak / rms), 3),
        "dc_offset": [float(x) for x in signal.mean(axis=0)],
        "stereo_correlation": round(float(np.corrcoef(signal.T)[0, 1]), 4),
        "clipped_samples": int(np.count_nonzero(np.abs(signal) >= 1)),
        "reference_bpm": 65,
        "seed": SEED,
    }
    return signal, stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--duration", type=float, default=26.0)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).with_name("kotto-seen-score.wav"))
    args = parser.parse_args()
    if not 10 <= args.duration <= 90:
        parser.error("duration must be between 10 and 90 seconds")
    signal, stats = make_score(args.duration)
    # Very quiet triangular dither. The final ten milliseconds stay fully silent.
    rng = np.random.default_rng(SEED + 1)
    dither = (rng.random(signal.shape) - rng.random(signal.shape)) / 65536.0
    dither[:48] = 0
    dither[-480:] = 0
    pcm = np.rint((signal + dither) * 32767.0).astype("<i2")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(args.output), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())
    stats["output"] = str(args.output.resolve())
    stats["file_bytes"] = args.output.stat().st_size
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
