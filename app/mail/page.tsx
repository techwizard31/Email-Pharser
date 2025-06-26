import { getSession, useSession } from "next-auth/react";
import axios from "axios";

export default function MailPage() {
  const { data: session } = useSession();
  const fetchGmail = async () => {
    const res = await axios.get("/api/gmail/fetch");
    console.log(res.data);
  };

  if (!session) {
    return <p>Please <a href="/api/auth/signin">login</a>.</p>;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.email}</h1>
      <button onClick={fetchGmail}>Fetch My Emails</button>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }
  return { props: {} };
}
