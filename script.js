document.addEventListener('DOMContentLoaded', function() {
    const addSignatureBtn = document.getElementById('add-signature');
    const signaturesContainer = document.getElementById('signatures-container');
    const noSignatures = document.getElementById('no-signatures');
    let signatureCount = 0;
    
    // Charger les signatures existantes depuis le stockage local
    loadSignatures();
    
    addSignatureBtn.addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const studentClass = document.getElementById('class').value.trim();
        
        if (name === '' || studentClass === '') {
            showMessage('Veuillez remplir tous les champs.', 'error');
            return;
        }
        
        // Vérifier si la signature existe déjà
        if (isDuplicateSignature(name, studentClass)) {
            showMessage('Cette signature existe déjà.', 'error');
            return;
        }
        
        addSignature(name, studentClass);
        showMessage('Signature ajoutée avec succès !', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('name').value = '';
        document.getElementById('class').value = '';
    });
    
    function addSignature(name, studentClass) {
        signatureCount++;
        
        if (noSignatures) {
            noSignatures.style.display = 'none';
        }
        
        const signatureItem = document.createElement('div');
        signatureItem.className = 'signature-item';
        signatureItem.innerHTML = `
            <span><strong>${signatureCount}.</strong> ${name} - ${studentClass}</span>
            <button class="delete-btn" onclick="deleteSignature(this)">×</button>
        `;
        
        // Animation d'ajout
        signatureItem.style.opacity = '0';
        signatureItem.style.transform = 'translateY(-10px)';
        
        signaturesContainer.appendChild(signatureItem);
        
        // Animation
        setTimeout(() => {
            signatureItem.style.transition = 'all 0.3s ease';
            signatureItem.style.opacity = '1';
            signatureItem.style.transform = 'translateY(0)';
        }, 10);
        
        // Mettre à jour le compteur
        updateSignatureCount();
        
        // Sauvegarder dans le stockage local
        saveSignatures();
    }
    
    function deleteSignature(button) {
        const signatureItem = button.parentElement;
        const signatureText = signatureItem.querySelector('span').textContent;
        
        // Animation de suppression
        signatureItem.style.transform = 'translateX(-100%)';
        signatureItem.style.opacity = '0';
        
        setTimeout(() => {
            signatureItem.remove();
            signatureCount--;
            updateSignatureCount();
            
            // Réorganiser les numéros
            renumberSignatures();
            
            // Sauvegarder
            saveSignatures();
            
            // Afficher "Aucune signature" si nécessaire
            if (signaturesContainer.children.length === 0 && noSignatures) {
                noSignatures.style.display = 'block';
            }
        }, 300);
    }
    
    function renumberSignatures() {
        const signatureItems = document.querySelectorAll('.signature-item');
        signatureCount = 0;
        
        signatureItems.forEach((item, index) => {
            signatureCount++;
            const span = item.querySelector('span');
            const text = span.textContent.replace(/^\d+\./, `${signatureCount}.`);
            span.innerHTML = `<strong>${signatureCount}.</strong>` + text.split('-')[0].split('.').pop() + '-' + text.split('-')[1];
        });
    }
    
    function updateSignatureCount() {
        let countElement = document.querySelector('.signature-count');
        if (!countElement) {
            countElement = document.createElement('div');
            countElement.className = 'signature-count';
            signaturesContainer.parentNode.insertBefore(countElement, signaturesContainer);
        }
        countElement.textContent = `Nombre de signatures : ${signatureCount}`;
    }
    
    function isDuplicateSignature(name, studentClass) {
        const signatureItems = document.querySelectorAll('.signature-item span');
        for (let item of signatureItems) {
            const text = item.textContent.toLowerCase();
            if (text.includes(name.toLowerCase()) && text.includes(studentClass.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
    
    function showMessage(message, type) {
        // Supprimer les messages existants
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        // Ajouter avant le formulaire
        const form = document.querySelector('.signature-form');
        form.parentNode.insertBefore(messageDiv, form);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
    
    function saveSignatures() {
        const signatures = [];
        const signatureItems = document.querySelectorAll('.signature-item span');
        
        signatureItems.forEach(item => {
            signatures.push(item.textContent.trim());
        });
        
        localStorage.setItem('petitionSignatures', JSON.stringify(signatures));
        localStorage.setItem('signatureCount', signatureCount);
    }
    
    function loadSignatures() {
        const savedSignatures = JSON.parse(localStorage.getItem('petitionSignatures')) || [];
        const count = parseInt(localStorage.getItem('signatureCount')) || 0;
        
        if (savedSignatures.length > 0 && noSignatures) {
            noSignatures.style.display = 'none';
            signatureCount = count;
            
            savedSignatures.forEach(signatureText => {
                const signatureItem = document.createElement('div');
                signatureItem.className = 'signature-item';
                signatureItem.innerHTML = `
                    <span>${signatureText}</span>
                    <button class="delete-btn" onclick="deleteSignature(this)">×</button>
                `;
                signaturesContainer.appendChild(signatureItem);
            });
            
            updateSignatureCount();
        }
    }
    
    // Fonctionnalité de téléchargement en PDF
    document.getElementById('download-pdf').addEventListener('click', function() {
        alert('Pour enregistrer en PDF : utilisez la fonction "Imprimer" de votre navigateur et choisissez "Enregistrer au format PDF" comme destination.');
    });
    
    // Rendre les fonctions accessibles globalement pour les événements onclick
    window.deleteSignature = deleteSignature;
});

// Fonction pour exporter les signatures en CSV (optionnel)
function exportToCSV() {
    const signatures = [];
    const signatureItems = document.querySelectorAll('.signature-item span');
    
    signatureItems.forEach(item => {
        signatures.push(item.textContent.trim());
    });
    
    let csvContent = "Numéro,Nom,Classe\n";
    signatures.forEach((signature, index) => {
        const parts = signature.split(' - ');
        const name = parts[0].replace(/^\d+\.\s*/, '').trim();
        const studentClass = parts[1] || '';
        csvContent += `${index + 1},"${name}","${studentClass}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'signatures_petition.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
