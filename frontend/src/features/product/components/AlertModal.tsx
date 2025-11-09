import './styles/AlertModal.css';

interface Props {
    onClose: () => void;
}

export default function AlertModal({ onClose }: Props) {

    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-content">
                <h2>Something went wrong</h2>
                <div className="alert-modal-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f44336"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" stroke="#f44336" fill="none" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                </div>
                <p>Please verify your information or try again later</p>
                <div className="alert-modal-actions">
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}