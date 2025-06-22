// useMailItem.js
export default function useMailItem(mail, { onClick, onTrash, onDeletePermanent, onRestore }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick(mail);
  };

  const handleTrash = (e) => {
    e.stopPropagation();
    onTrash(mail.id);
  };

  const handleDeletePermanent = (e) => {
    e.stopPropagation();
    onDeletePermanent(mail.id);
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    onRestore(mail.id);
  };

  const hasLabel = (labelId) => mail.labels?.includes(labelId);

  return {
    handleClick,
    handleTrash,
    handleDeletePermanent,
    handleRestore,
    hasLabel
  };
}
