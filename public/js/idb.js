let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore('pending', {
        autoIncrement: true
    })
}

request.onsuccess = ({ target }) => {
    db = target.result;
    console.log(db)
    if (navigator.onLine) {
        check()
    }
}

request.onerror = function (event) {
    console.log(event.target.errorCode)
}

// function to save record/input
function save(record) {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    store.add(record)
}

// function to check database
function check() {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const getAll = store.getAll()

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(['pending'], 'readwrite')
                    const store = transaction.objectStore('pending')
                    store.clear()
                })
        }
    }
}
window.addEventListener('online', check)