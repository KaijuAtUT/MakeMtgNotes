function copyMeetingNotesTemplate() {
  const templateId = ""; // テンプレのIDを入れる
  const SLACK_WEBHOOK_URL = ""; // Slackに転送するためのwebhook URLを入れる

  // 次の水曜日の日付を取得
  const wednesdayDate = getNextWednesday();

  // 会議の日付を作成
  const meetingDate = Utilities.formatDate(wednesdayDate, 'JST', 'yyyyMMdd');

  // 議事録を複製
  const templateFile = DriveApp.getFileById(templateId);
  const duplicatedFile = templateFile.makeCopy(meetingDate + '_議事録');

  // 複製したファイルの ID を取得
  const newFileId = duplicatedFile.getId();
  const fileUrl = duplicatedFile.getUrl();

  // Slackに転送する
  sendToSlack(SLACK_WEBHOOK_URL, `新しい議事録が作成されました！\n${fileUrl}`);

  // 複製したファイル内の {date} を次の水曜日に置換
  replacePlaceholderInFile(newFileId, '{date}', Utilities.formatDate(wednesdayDate, 'JST', 'yyyyMMdd'));
  replacePlaceholderInFile(newFileId, '{DATE}', Utilities.formatDate(wednesdayDate, 'JST', 'yyyy/MM/dd'));
}

// 次の水曜日の日付を取得する関数
function getNextWednesday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const difference = dayOfWeek <= 3 ? (3 - dayOfWeek) : (10 - dayOfWeek); // 次の水曜日までの日数
  const wednesdayDate = new Date(today);
  wednesdayDate.setDate(today.getDate() + difference);
  return wednesdayDate;
}

// ファイル内の指定されたテキストを置換する関数
function replacePlaceholderInFile(fileId, placeholder, replacement) {
  const document = DocumentApp.openById(fileId);
  const body = document.getBody();
  body.replaceText(placeholder, replacement);
  document.saveAndClose();
}

// Slackに転送する
function sendToSlack(webhookUrl, message) {
  const payload = {
    text: message,
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(webhookUrl, options);
}