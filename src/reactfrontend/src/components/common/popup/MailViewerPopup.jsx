import Popup from "./Popup";
import MailViewerContent from "./forms/MailViewerContent";

/**
 * MailViewerPopup
 * Shows a mail in read-only mode inside a reusable popup.
 */
export default function MailViewerPopup({ mail, onClose }) {
  return (
    <Popup onClose={onClose} className="mail-viewer-popup">
      <MailViewerContent mail={mail} />
    </Popup>
  );
}
