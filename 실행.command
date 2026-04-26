#!/bin/bash
cd "$(dirname "$0")"

echo "기존 서버를 종료합니다..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# node_modules 없으면 자동 설치
if [ ! -d "node_modules" ]; then
  echo "패키지를 설치합니다 (최초 1회)..."
  npm install
fi

echo "서버를 시작합니다..."
npm run dev &

echo "브라우저를 여는 중..."
sleep 6
open http://localhost:3000

wait
