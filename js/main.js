const books = []; 
const RENDER_EVENT = 'render-book'; 
const SAVED_EVENT = 'saved-book'; 
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date(); 
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.setAttribute('data-testid', 'bookItemTitle');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.setAttribute('data-testid', 'bookItemAuthor');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.setAttribute('data-testid', 'bookItemYear');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        undoButton.classList.add('undo-button');
        undoButton.innerText = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
        trashButton.classList.add('trash-button');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        container.append(undoButton, trashButton);
    } 
    else {
        const checkButton = document.createElement('button');
        checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        checkButton.classList.add('check-button');
        checkButton.innerText = 'Selesai dibaca';

        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
        trashButton.classList.add('trash-button');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        container.append(checkButton, trashButton);
    }
    return container;
}

// Kriteria Wajib 1: Gunakan localStorage sebagai Penyimpanan
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Kriteria Wajib 2: Mampu Menambahkan Buku
function addBook() {
    const textTitle = document.getElementById('bookFormTitle').value;
    const textAuthor = document.getElementById('bookFormAuthor').value;
    const textYear = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (isNaN(textYear)) {
        alert('Tahun harus berupa angka yang valid!');
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Kriteria Wajib 3: Memiliki Dua Rak Buku
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            incompleteBookList.append(bookElement);
        } 
        else {
            completeBookList.append(bookElement);
        }
    }
});

// Kriteria Wajib 4: Dapat Memindahkan Buku Antar Rak
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Kriteria Wajib 5: Dapat Menghapus Data Buku
function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Kriteria Opsional 1: Menambahkan Fitur Pencarian Buku
function searchBooks(title) {
    const searchResults = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    return searchResults;
}

function renderSearchResults(searchResults) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const book of searchResults) {
        const bookElement = makeBook(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('searchBookTitle').value;
        const searchResults = searchBooks(title);
        renderSearchResults(searchResults);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});