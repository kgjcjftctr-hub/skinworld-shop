#!/usr/bin/env bash
# Construye outputs/SEGURO_demo_3D.mp4 desde cero (todo local, sin servicios externos).
set -euo pipefail
cd "$(dirname "$0")"
OUT=../../outputs/SEGURO_demo_3D.mp4
mkdir -p ../../outputs intermedios
[ -d node_modules/three ] || npm install
node render.mjs --video intermedios/video_sin_audio.mp4     # 3D: Three.js en Chromium headless → H.264
python3 audio.py intermedios/audio.wav                      # audio original sintetizado
ffmpeg -y -loglevel error -i intermedios/video_sin_audio.mp4 -i intermedios/audio.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
