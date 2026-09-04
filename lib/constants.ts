export type MeetingMinutes = {
  summary: string;
  decisions: string;
  action_items: { task: string; assignee: string }[] | string;
  transcript: { time: string; speaker: string; text: string }[] | string;
};

export const TEMPLATE_SALES = `📋 미팅 결과 보고서\n\n1️⃣ 기본 정보\n업체명: [파악된 업체명 작성]\n미팅 일시: [미팅 날짜 및 시간]\n참석자: [참석자 명단 기재]\n\n2️⃣ 미팅 목적\n- [미팅의 주요 목적을 개조식으로 요약]\n\n3️⃣ 주요 논의 사항\n📌 안건 1. [논의된 첫 번째 안건 제목]\n- [해당 안건의 세부 논의 내용 요약]\n\n💬 질의응답 정리본\n📌 Q. [핵심 질문 내용]\nA. [질문에 대한 답변 내용]`;

export const TEMPLATE_SCRUM = `🏃‍♂️ 데일리 스크럼\n\n1️⃣ 어제 한 일 (Done)\n- [어제 완료한 주요 업무 내용]\n\n2️⃣ 오늘 할 일 (To-Do)\n- [오늘 진행할 핵심 목표 및 업무]\n\n3️⃣ 이슈 및 공유사항 (Blockers)\n- [업무 진행을 방해하는 장애물이나 팀원들과 공유할 내용]`;

export const TEMPLATE_BASIC = `📝 회의 주요 내용\n\n🎯 회의 안건\n- [회의 주요 안건 기재]\n\n✅ 결정 사항\n- [회의를 통해 최종 결정된 항목 기재]\n\n🏃‍♂️ Action Items (향후 계획)\n- [누가, 언제까지, 무엇을 할 것인지 기재]`;
