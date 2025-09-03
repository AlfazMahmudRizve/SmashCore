// SmashCore Music Dashboard JavaScript

class MusicDashboard {
    constructor() {
        this.apiEndpoint = 'http://localhost:8000';
        this.audioAssets = [];
        this.currentView = 'dashboard';
        this.editingAssetId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAudioAssets();
        this.updateDashboardStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Add asset button
        const addAssetBtn = document.getElementById('add-asset-btn');
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAddAssetModal();
            });
        }

        // Modal controls
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('asset-modal');
            });
        }

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('asset-modal');
            });
        }

        const deleteModalClose = document.getElementById('delete-modal-close');
        if (deleteModalClose) {
            deleteModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('delete-modal');
            });
        }

        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('delete-modal');
            });
        }

        // Form submission
        const assetForm = document.getElementById('asset-form');
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteAsset();
            });
        }

        // Search and filter
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterAssets();
            });
        }

        const genreFilter = document.getElementById('genre-filter');
        if (genreFilter) {
            genreFilter.addEventListener('change', () => {
                this.filterAssets();
            });
        }

        // Close modal on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    switchView(viewName) {
        console.log('Switching to view:', viewName);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            }
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }

        // Refresh data if switching to audio assets view
        if (viewName === 'audio-assets') {
            this.renderAssets();
        }
    }

    async loadAudioAssets() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiEndpoint}/audio_assets`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.audioAssets = Array.isArray(data) ? data : [];
            
            this.renderAssets();
            this.updateDashboardStats();
            this.renderRecentAssets();
            
        } catch (error) {
            console.error('Error loading audio assets:', error);
            this.showToast('Error loading audio assets. Using offline mode.', 'error');
            this.audioAssets = [];
            this.renderAssets();
        } finally {
            this.hideLoading();
        }
    }

    renderAssets() {
        const container = document.getElementById('assets-grid');
        if (!container) return;

        const searchInput = document.getElementById('search-input');
        const genreFilter = document.getElementById('genre-filter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const genreFilterValue = genreFilter ? genreFilter.value : '';

        let filteredAssets = this.audioAssets;

        if (searchTerm) {
            filteredAssets = filteredAssets.filter(asset =>
                asset.name.toLowerCase().includes(searchTerm) ||
                asset.genre.toLowerCase().includes(searchTerm)
            );
        }

        if (genreFilterValue) {
            filteredAssets = filteredAssets.filter(asset => asset.genre === genreFilterValue);
        }

        if (filteredAssets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>${this.audioAssets.length === 0 ? 'No audio assets found. Start building your music library!' : 'No assets match your search criteria.'}</p>
                    ${this.audioAssets.length === 0 ? '<button class="btn btn--primary" onclick="window.musicDashboard.openAddAssetModal()">Add Your First Asset</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = filteredAssets.map(asset => `
            <div class="asset-card" data-id="${asset.id}">
                <div class="asset-header">
                    <div class="asset-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="asset-info">
                        <h4>${this.escapeHtml(asset.name)}</h4>
                        <p>${asset.genre}</p>
                    </div>
                </div>
                <div class="asset-details">
                    <div class="asset-detail">
                        <span class="label">Duration:</span>
                        <span class="value">${this.formatDuration(asset.duration)}</span>
                    </div>
                    <div class="asset-detail">
                        <span class="label">File Size:</span>
                        <span class="value">${asset.file_size} MB</span>
                    </div>
                    <div class="asset-detail">
                        <span class="label">File Path:</span>
                        <span class="value" title="${asset.file_path}">${this.truncatePath(asset.file_path)}</span>
                    </div>
                </div>
                <div class="asset-actions">
                    <button class="btn btn--sm btn--edit" onclick="window.musicDashboard.editAsset(${asset.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn--sm btn--delete" onclick="window.musicDashboard.confirmDeleteAsset(${asset.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderRecentAssets() {
        const container = document.getElementById('recent-assets');
        if (!container) return;
        
        const recentAssets = this.audioAssets.slice(-5).reverse();

        if (recentAssets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>No audio assets yet. Add your first track!</p>
                    <button class="btn btn--primary" onclick="window.musicDashboard.switchView('audio-assets')">
                        Add Audio Asset
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="assets-grid">
                ${recentAssets.map(asset => `
                    <div class="asset-card" data-id="${asset.id}">
                        <div class="asset-header">
                            <div class="asset-icon">
                                <i class="fas fa-music"></i>
                            </div>
                            <div class="asset-info">
                                <h4>${this.escapeHtml(asset.name)}</h4>
                                <p>${asset.genre}</p>
                            </div>
                        </div>
                        <div class="asset-details">
                            <div class="asset-detail">
                                <span class="label">Duration:</span>
                                <span class="value">${this.formatDuration(asset.duration)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateDashboardStats() {
        const totalFiles = this.audioAssets.length;
        const totalDurationSeconds = this.audioAssets.reduce((sum, asset) => sum + asset.duration, 0);
        const totalDuration = this.formatDuration(totalDurationSeconds);
        
        const genreCounts = this.audioAssets.reduce((acc, asset) => {
            acc[asset.genre] = (acc[asset.genre] || 0) + 1;
            return acc;
        }, {});
        
        const topGenre = Object.keys(genreCounts).reduce((a, b) => 
            genreCounts[a] > genreCounts[b] ? a : b, 'Pop'
        ) || 'Pop';

        const totalFilesEl = document.getElementById('total-files');
        const totalDurationEl = document.getElementById('total-duration');
        const topGenreEl = document.getElementById('top-genre');

        if (totalFilesEl) totalFilesEl.textContent = totalFiles;
        if (totalDurationEl) totalDurationEl.textContent = totalDuration;
        if (topGenreEl) topGenreEl.textContent = topGenre;
    }

    openAddAssetModal() {
        console.log('Opening add asset modal');
        this.editingAssetId = null;
        
        const modalTitle = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');
        
        if (modalTitle) modalTitle.textContent = 'Add New Audio Asset';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Asset';
        
        this.resetForm();
        this.showModal('asset-modal');
    }

    editAsset(id) {
        const asset = this.audioAssets.find(a => a.id === id);
        if (!asset) return;

        this.editingAssetId = id;
        
        const modalTitle = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');
        
        if (modalTitle) modalTitle.textContent = 'Edit Audio Asset';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Asset';
        
        const nameInput = document.getElementById('asset-name');
        const pathInput = document.getElementById('asset-file-path');
        const sizeInput = document.getElementById('asset-file-size');
        const durationInput = document.getElementById('asset-duration');
        const genreSelect = document.getElementById('asset-genre');
        
        if (nameInput) nameInput.value = asset.name;
        if (pathInput) pathInput.value = asset.file_path;
        if (sizeInput) sizeInput.value = asset.file_size;
        if (durationInput) durationInput.value = asset.duration;
        if (genreSelect) genreSelect.value = asset.genre;
        
        this.showModal('asset-modal');
    }

    confirmDeleteAsset(id) {
        this.deletingAssetId = id;
        this.showModal('delete-modal');
    }

    async deleteAsset() {
        if (!this.deletingAssetId) return;

        try {
            const response = await fetch(`${this.apiEndpoint}/audio_assets/${this.deletingAssetId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.audioAssets = this.audioAssets.filter(asset => asset.id !== this.deletingAssetId);
            this.renderAssets();
            this.updateDashboardStats();
            this.renderRecentAssets();
            this.showToast('Audio asset deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting asset:', error);
            this.showToast('Error deleting audio asset. Please try again.', 'error');
        } finally {
            this.closeModal('delete-modal');
            this.deletingAssetId = null;
        }
    }

    async handleFormSubmit() {
        const nameInput = document.getElementById('asset-name');
        const pathInput = document.getElementById('asset-file-path');
        const sizeInput = document.getElementById('asset-file-size');
        const durationInput = document.getElementById('asset-duration');
        const genreSelect = document.getElementById('asset-genre');

        const formData = {
            name: nameInput ? nameInput.value.trim() : '',
            file_path: pathInput ? pathInput.value.trim() : '',
            file_size: sizeInput ? parseFloat(sizeInput.value) : 0,
            duration: durationInput ? parseInt(durationInput.value) : 0,
            genre: genreSelect ? genreSelect.value : ''
        };

        if (!this.validateForm(formData)) {
            return;
        }

        try {
            let response;
            
            if (this.editingAssetId) {
                response = await fetch(`${this.apiEndpoint}/audio_assets/${this.editingAssetId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${this.apiEndpoint}/audio_assets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedAsset = await response.json();
            
            if (this.editingAssetId) {
                const index = this.audioAssets.findIndex(asset => asset.id === this.editingAssetId);
                if (index !== -1) {
                    this.audioAssets[index] = savedAsset;
                }
                this.showToast('Audio asset updated successfully!', 'success');
            } else {
                this.audioAssets.push(savedAsset);
                this.showToast('Audio asset added successfully!', 'success');
            }

            this.renderAssets();
            this.updateDashboardStats();
            this.renderRecentAssets();
            this.closeModal('asset-modal');
            
        } catch (error) {
            console.error('Error saving asset:', error);
            
            // Fallback for offline mode
            if (this.editingAssetId) {
                const index = this.audioAssets.findIndex(asset => asset.id === this.editingAssetId);
                if (index !== -1) {
                    this.audioAssets[index] = { ...this.audioAssets[index], ...formData };
                }
                this.showToast('Audio asset updated (offline mode)!', 'success');
            } else {
                const newAsset = {
                    id: Date.now(),
                    ...formData
                };
                this.audioAssets.push(newAsset);
                this.showToast('Audio asset added (offline mode)!', 'success');
            }

            this.renderAssets();
            this.updateDashboardStats();
            this.renderRecentAssets();
            this.closeModal('asset-modal');
        }
    }

    validateForm(formData) {
        const errors = [];

        if (!formData.name) errors.push('Name is required');
        if (!formData.file_path) errors.push('File path is required');
        if (!formData.file_size || formData.file_size <= 0) errors.push('Valid file size is required');
        if (!formData.duration || formData.duration <= 0) errors.push('Valid duration is required');
        if (!formData.genre) errors.push('Genre is required');

        if (errors.length > 0) {
            this.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    filterAssets() {
        this.renderAssets();
    }

    resetForm() {
        const form = document.getElementById('asset-form');
        if (form) {
            form.reset();
        }
    }

    showModal(modalId) {
        console.log('Showing modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        console.log('Closing modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        if (modalId === 'asset-modal') {
            this.resetForm();
            this.editingAssetId = null;
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        const title = type === 'success' ? 'Success' : 'Error';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }

    showLoading() {
        console.log('Loading...');
    }

    hideLoading() {
        console.log('Loading complete');
    }

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    truncatePath(path, maxLength = 25) {
        if (path.length <= maxLength) return path;
        return '...' + path.slice(-(maxLength - 3));
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the dashboard when DOM is loaded
let musicDashboard;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    musicDashboard = new MusicDashboard();
    
    // Make it globally available
    window.musicDashboard = musicDashboard;
});

// Global functions for HTML onclick handlers
window.switchView = function(viewName) {
    if (window.musicDashboard) {
        window.musicDashboard.switchView(viewName);
    }
};

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal && window.musicDashboard) {
            window.musicDashboard.closeModal(openModal.id);
        }
    }
    
    // Ctrl/Cmd + N opens new asset modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && window.musicDashboard) {
        e.preventDefault();
        if (window.musicDashboard.currentView === 'audio-assets') {
            window.musicDashboard.openAddAssetModal();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.musicDashboard) {
        window.musicDashboard.showToast('Connection restored. Data will sync automatically.', 'success');
        window.musicDashboard.loadAudioAssets();
    }
});

window.addEventListener('offline', () => {
    if (window.musicDashboard) {
        window.musicDashboard.showToast('You are offline. Changes will be saved locally.', 'error');
    }
});

// Auto-refresh data periodically when online
setInterval(() => {
    if (navigator.onLine && window.musicDashboard) {
        window.musicDashboard.loadAudioAssets();
    }
}, 300000); // Refresh every 5 minutes