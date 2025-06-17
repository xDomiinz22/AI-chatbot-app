import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SettingsConversationsProps {
    conversationId: number;
    onDownload: (id: number) => void;
    onDelete: (id: number) => void;
    onRename: (id: number) => void;
    onClose: () => void;
    anchorRect: DOMRect; // posición del botón para posicionar el menú
    buttonRef?: HTMLButtonElement | null;

}

const SettingsConversations: React.FC<SettingsConversationsProps> = ({
    conversationId,
    onDownload,
    onDelete,
    onRename,
    onClose,
    anchorRect,
    buttonRef,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Opcional: cerrar menú si clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, buttonRef]);

    // Encontrar el contenedor portal en el DOM
    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) return null;

    return createPortal(
        <div ref={menuRef} style={{
            top: anchorRect.bottom + window.scrollY,
            left: anchorRect.right + window.scrollX,
        }}
            className="absolute z-[1000] bg-[#27857a] p-2 rounded shadow-lg">
            <button onClick={() => { onDownload(conversationId); onClose(); }} className="text-gray-100 block w-full text-left px-4 py-2 hover:bg-[#528f88]">
                Download
            </button>
            <button onClick={() => { onDelete(conversationId); onClose(); }} className="text-gray-100 block w-full text-left px-4 py-2 hover:bg-[#528f88]">
                Delete
            </button>
            <button onClick={() => { onRename(conversationId); onClose(); }} className="text-gray-100 block w-full text-left px-4 py-2 hover:bg-[#528f88]">
                Change title
            </button>
        </div>,
        portalRoot
    );
};

export default SettingsConversations;
