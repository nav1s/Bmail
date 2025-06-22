import { useState } from "react";
import Header from "./Header";
import AccountPopup from "../common/popup/AccountPopup";

/**
 * AppLayout
 *
 * Shared layout used by all pages (Inbox, Login, Register).
 * Renders Header and account popup (if logged in and toggled).
 *
 * Props:
 * - children: Page content to render under layout
 */
export default function AppLayout({ children }) {
  const [showAccount, setShowAccount] = useState(false);

  return (
    <div>
      <Header onAvatarClick={() => setShowAccount(true)} />

      {showAccount && (
        <AccountPopup onClose={() => setShowAccount(false)} />
      )}

      <main>{children}</main>
    </div>
  );
}
