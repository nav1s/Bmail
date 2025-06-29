import Popup from "./Popup";
import MailSentPopupContent from "./forms/MailSentPopupContent";

/**
 * MailSentPopup
 * Standardized popup to confirm mail has been sent.
 */
export default function MailSentPopup({ onClose }) {
  return (
    <Popup onClose={onClose} className="mail-sent-popup">
      <MailSentPopupContent onClose={onClose} />
    </Popup>
  );
}
