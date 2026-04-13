# CHANGELOG

## [0.5.2] - 2026-04-13

### Added
- Supabase `project URL`과 `publishable key`를 사용하는 프론트엔드 인증 연결을 추가했다.
- 이메일/비밀번호 기반 회원가입, 로그인, 로그아웃 기능을 추가했다.
- 화면 오른쪽 위에 고정되는 계정 패널 UI를 추가했다.

### Changed
- 시작 오버레이를 게임 시작 안내 중심으로 다시 정리했다.
- 로그인한 계정이 있으면 닉네임 안내가 계정 이메일 기준으로 동작하도록 조정했다.
- 로그인하지 않은 상태에서는 게임을 시작할 수 없도록 변경했다.
- 기존 브라우저 랭킹 저장 로직이 로그인 계정 식별자를 함께 활용하도록 바꿨다.

### Notes
- 현재 인증은 Supabase Email provider 기준으로 연결되어 있다.
- 랭킹은 아직 Supabase DB가 아니라 브라우저 `localStorage`에 저장된다.

## [0.5.3] - 2026-04-13

### Added
- Supabase `rankings` 테이블 생성용 SQL 파일 `supabase/online-ranking.sql`을 추가했다.

### Changed
- 랭킹 저장 방식을 브라우저 `localStorage`에서 Supabase 온라인 랭킹으로 전환했다.
- 게임 오버 시 점수 저장이 비동기로 처리되도록 바꿨다.
- 랭킹 패널이 Supabase에서 실시간으로 상위 점수를 불러오도록 변경했다.

### Notes
- 온라인 랭킹 사용 전 `supabase/online-ranking.sql`을 Supabase `SQL Editor`에서 실행해야 한다.
- 현재 구조에서는 `Secret key` 없이 `publishable key`와 RLS 정책만으로 온라인 랭킹을 처리한다.
