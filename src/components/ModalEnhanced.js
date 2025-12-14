import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

/**
 * ModalEnhanced Component
 * Enhanced modal using HeadlessUI Dialog and DaisyUI styling
 */
const ModalEnhanced = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md', 
    showCloseButton = true 
}) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-base-100 shadow-2xl transition-all`}>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-base-300">
                                    <Dialog.Title className="text-2xl font-bold text-base-content font-georgia">
                                        {title}
                                    </Dialog.Title>
                                    
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="btn btn-ghost btn-circle btn-sm"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModalEnhanced;
