// components/ConfirmationModal.jsx
import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onConfirm, onCancel, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={onCancel} className="cancel-btn">No</button>
                    <button onClick={onConfirm} className="confirm-btn">Yes</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
