import { simpleParser } from 'mailparser';
import imaps from 'imap-simple';

interface ParsedEmail {
  messageId: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  claimNumber?: string;
}

export async function fetchUnreadEmails(): Promise<ParsedEmail[]> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables must be set.');
  }

  const config = {
    imap: {
      user: emailUser,
      password: emailPass,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 5000,
    },
  };

  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');

  const searchCriteria = ['UNSEEN'];
  const fetchOptions = {
    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
    struct: true,
    markSeen: true,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);

  const parsedEmails: ParsedEmail[] = [];

  for (const item of messages) {
    const all = item.parts.find(part => part.which === 'TEXT');
    const idHeader = 'Imap-Id: ' + item.attributes.uid + '\r\n';

    const parsed = await simpleParser(idHeader + all?.body);
    const claimMatch = parsed.text?.match(/Claim\s*Number[:\-]?\s*(\w+)/i);

    parsedEmails.push({
      messageId: parsed.messageId || String(item.attributes.uid),
      sender: parsed.from?.text || 'Unknown Sender',
      subject: parsed.subject || '(No Subject)',
      preview: parsed.text?.slice(0, 120) || '',
      time: parsed.date?.toLocaleString() || new Date().toLocaleString(),
      claimNumber: claimMatch ? claimMatch[1] : undefined,
    });
  }

  connection.end();
  return parsedEmails;
}
