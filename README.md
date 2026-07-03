# 지이환경(gewater.co.kr) 정적 사이트 클론

원본 https://www.gewater.co.kr 를 다른 호스팅으로 이전하기 위해 만든 정적 HTML/CSS/JS 사본입니다.
브라우저 자동화 없이 원본 서버의 실제 HTML/CSS/JS/이미지/폰트를 직접 받아 재구성했습니다.

## 업로드 방법

이 디렉토리에서 `build/`, `README.md`, `verify_assets.sh`, `fetch_errors.log`를 **제외한** 나머지
(16개 `.html` 파일 + `assets/` 폴더)를 그대로 새 호스팅의 웹 루트에 업로드하면 됩니다.
서버사이드 언어(PHP 등)나 데이터베이스가 전혀 필요 없는 순수 정적 파일입니다.

```
index.html, company-greeting.html, ... (16개)
assets/
  css/  js/  font/  img/
```

## 로컬에서 미리보기

```bash
python3 -m http.server 8765
# 브라우저에서 http://localhost:8765/index.html 접속
```

원본 사이트(https://www.gewater.co.kr)와 새 창을 나란히 띄워 페이지별로 레이아웃/텍스트/이미지/
반응형 동작을 비교해 주세요. 문제가 있으면 알려주시면 수정하겠습니다.

## 원본과 다르게 처리한 부분 (반드시 확인해 주세요)

1. **문의하기 폼(`contact.html`)은 Netlify Forms로 동작하도록 연결되어 있습니다.**
   원본은 Cafe24 호스팅사의 폼메일 서버로 데이터를 전송했는데, 이 백엔드는 새 호스팅에서 쓸 수
   없어서 대신 Netlify의 무료 폼 처리 기능(Netlify Forms)에 연결했습니다. `<form>`에
   `data-netlify="true"`와 `form-name` hidden 필드, 스팸 방지용 honeypot 필드(`bot-field`)를
   추가했고, "보내기" 클릭 시 JS가 `fetch()`로 실제 제출 후 성공/실패 안내 메시지를 보여줍니다.
   **단, 이 기능은 Netlify에 배포했을 때만 동작합니다** — GitHub Pages 등 다른 호스팅에 올리거나
   로컬 `python -m http.server`로 열면 제출이 실패합니다(아래 "Netlify 배포" 섹션 참고). 접수된
   문의는 Netlify 대시보드의 Forms 메뉴에서 확인하거나, 이메일 알림으로 받도록 설정할 수 있습니다.

2. **공지사항(`notice.html`)·작업사진란(`gallery.html`)은 이전 시점의 스냅샷입니다.**
   원본은 관리자가 게시물을 추가/삭제할 수 있는 Cafe24 게시판이었지만, 정적 사이트에는 그런
   기능이 없습니다. 마이그레이션 시점에 실제로 등록되어 있던 내용(공지 1건, 작업사진 3건)을
   그대로 정적 HTML로 옮겼습니다. 이후 게시물을 추가하려면 해당 `.html` 파일을 직접 편집해야
   합니다.

3. **개인정보처리방침(`privacy-policy.html`)의 회사명이 'OOOOO'로 되어 있습니다.**
   원본 사이트 자체에 이 플레이스홀더가 채워지지 않은 채로 게시되어 있어 그대로 옮겼습니다.
   실제 회사명(지이환경)으로 교체가 필요하면 해당 파일에서 검색해 수정해 주세요.

4. **폐수처리 시설 페이지(`water-mgmt-wastewater.html`)의 "생물학적" 이미지 1장이 회색
   placeholder(`assets/img/sub-water-waste2-placeholder.png`)로 대체되어 있습니다.**
   원본 사이트에서도 해당 이미지 파일 자체가 404(존재하지 않음)였고, 원본 문구도 "(이미지가
   없습니다)"라고 되어 있어 실제로 누락된 상태였습니다. 나중에 실제 사진이 있으면 같은 파일명
   으로 교체하거나 `<img>` 경로를 바꿔주세요.

5. **푸터의 "admin" 링크는 비활성화(`href="#"`) 처리했습니다.**
   원본에서 Cafe24 관리자 로그인 페이지로 연결되던 링크였는데, 정적 사이트에는 해당 관리자
   시스템이 없으므로 제거했습니다. 개인정보처리방침/이메일무단수집거부 2개 링크는 실제 페이지
   내용이 있어 그대로 포함했습니다.

6. **네비게이션 활성 표시(강조) 로직을 원본보다 정확하게 고쳤습니다.**
   원본은 페이지 URL의 `sub=` 값만 보고 활성 메뉴를 표시해서, 실제로는 관련 없는 다른 대분류의
   하위 메뉴까지 함께 강조되는 버그가 있었습니다(예: `sub=02`인 페이지를 보면 5개 대분류의
   "2번째 하위메뉴"가 전부 강조됨). 이 사본에서는 실제로 보고 있는 메뉴 항목 하나만 정확히
   강조되도록 고쳤습니다. 시각적 디자인/색상은 그대로이며 강조되는 항목의 정확성만 개선한
   것입니다.

## 유지된 외부 리소스

- jQuery 3.7.1, slick-carousel 1.8.1 (CDN)
- 오시는길 페이지의 Daum 지도 임베드 스크립트 (Daum의 공개 지도 서비스, 별도 백엔드 불필요)

이 세 가지는 Cafe24 자체 호스팅 백엔드가 아닌 공개 서비스라 그대로 유지했습니다. 반대로 원본의
Cafe24 전용 스크립트(`/cjs/formmail.js`, `/cjs/board.js`, `/cjs/javascript.lib.js`, 방문자 로그
비콘 `blg-jsk.cafe24.com/weblog.js`)는 새 호스팅에서 동작하지 않으므로 전부 제거했습니다.

## Netlify 배포

이 저장소에는 `netlify.toml`이 이미 포함되어 있어 별도 빌드 설정 없이 바로 연결할 수 있습니다.

1. https://app.netlify.com 에서 "Add new site" → "Import an existing project" → GitHub 선택 후
   `sukkyun2/gewater` 저장소를 선택합니다.
2. Build command는 비워두고, Publish directory는 `.`(저장소 루트)로 둡니다. `netlify.toml`이
   이미 이렇게 지정되어 있어 보통 자동으로 채워집니다.
3. 배포가 끝나면 Netlify가 `xxx.netlify.app` 형태의 임시 주소를 줍니다. 여기서 먼저 페이지들이
   잘 뜨는지, 문의하기 폼이 실제로 접수되는지 확인해 보세요.
4. **Forms 활성화 확인**: Site settings → Forms 메뉴에 "contact"라는 이름의 폼이 자동으로
   잡혀 있어야 합니다(정적 HTML을 배포할 때 Netlify가 자동으로 폼을 스캔합니다). 잡혀 있지
   않다면 재배포(Trigger deploy)를 한 번 더 해보세요.
5. **알림 이메일 설정**: Site settings → Forms → Form notifications 에서 "Email notification"을
   추가하면, 문의가 들어올 때마다 지정한 이메일(예: ge8360@naver.com)로 알림을 받을 수 있습니다.
6. **커스텀 도메인 연결**: Site settings → Domain management → Add a domain 에서 구매한 도메인을
   입력하면 필요한 DNS 값(ALIAS/CNAME 또는 Netlify DNS 네임서버)을 안내해 줍니다. 도메인
   등록대행사(가비아/후이즈 등)에서 그 값을 그대로 등록하면 HTTPS 인증서까지 자동으로 발급됩니다.

## build/ 폴더

`build/`는 이 정적 페이지들을 생성하는 데 사용한 스크립트(`build.js`)와 원본 자료
(공통 헤더/푸터/사이트맵 조각, 페이지별 본문, 페이지 메타데이터)입니다. 호스팅 업로드에는
필요 없고, 나중에 문구를 수정하고 재생성하고 싶을 때만 참고하면 됩니다.

```bash
node build/build.js   # build/ 안의 내용을 바탕으로 루트에 16개 .html을 다시 생성
```

## 자체 점검 스크립트

```bash
./verify_assets.sh
```

빌드된 페이지의 모든 상대경로 참조(이미지/CSS/JS/내부링크)가 실제 파일로 존재하는지, 원본
호스팅사(cafe24/bizdemo58232/gewater.co.kr 등) 흔적이 남아있지 않은지, 16개 페이지가 모두
내비게이션에서 도달 가능한지를 확인합니다. 마지막 실행 결과: 전체 통과.
