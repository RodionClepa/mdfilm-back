import { useNavigate } from 'react-router-dom';

type Props = {
  mediaId: number;
  active: boolean;
  onToggle: (mediaId: number) => void;
  disabled?: boolean;
};

function hasJwt() {
  return Boolean(localStorage.getItem('mdfilm-jwt'));
}

export function BookmarkStar({ mediaId, active, onToggle, disabled }: Props) {
  const nav = useNavigate();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!hasJwt()) {
      nav(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (disabled) return;
    onToggle(mediaId);
  }

  return (
    <button
      type="button"
      className={active ? 'bookmark-star active' : 'bookmark-star'}
      onClick={onClick}
      title={active ? 'Remove bookmark' : 'Add bookmark'}
      aria-label={active ? 'Remove bookmark' : 'Add bookmark'}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
