const books = []; 
const RENDER_EVENT = 'render-book'; 
const SAVED_EVENT = 'saved-book'; 
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Your browser does not support local storage');
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
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card bg-gray-50 p-4 rounded-lg border border-gray-200';
    bookCard.setAttribute('data-bookid', bookObject.id);
    bookCard.setAttribute('data-testid', 'bookItem');

    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-gray-800 mb-1';
    title.setAttribute('data-testid', 'bookItemTitle');
    title.textContent = bookObject.title;

    const author = document.createElement('p');
    author.className = 'text-sm text-gray-600 mb-1';
    author.setAttribute('data-testid', 'bookItemAuthor');
    author.textContent = `Author: ${bookObject.author}`;

    const year = document.createElement('p');
    year.className = 'text-sm text-gray-600 mb-3';
    year.setAttribute('data-testid', 'bookItemYear');
    year.textContent = `Year: ${bookObject.year}`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2';

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.className = 'flex-1 bg-yellow-100 text-yellow-800 py-1 px-3 rounded text-sm font-medium hover:bg-yellow-200 transition flex items-center justify-center gap-1';
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        undoButton.innerHTML = '<i class="fas fa-undo-alt text-xs"></i> Mark Unread';
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.className = 'flex-1 bg-red-100 text-red-800 py-1 px-3 rounded text-sm font-medium hover:bg-red-200 transition flex items-center justify-center gap-1';
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
        trashButton.innerHTML = '<i class="fas fa-trash-alt text-xs"></i> Delete';
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        buttonContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.className = 'flex-1 bg-green-100 text-green-800 py-1 px-3 rounded text-sm font-medium hover:bg-green-200 transition flex items-center justify-center gap-1';
        checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        checkButton.innerHTML = '<i class="fas fa-check-circle text-xs"></i> Mark Read';
        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.className = 'flex-1 bg-red-100 text-red-800 py-1 px-3 rounded text-sm font-medium hover:bg-red-200 transition flex items-center justify-center gap-1';
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
        trashButton.innerHTML = '<i class="fas fa-trash-alt text-xs"></i> Delete';
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        buttonContainer.append(checkButton, trashButton);
    }

    bookCard.append(title, author, year, buttonContainer);
    return bookCard;
}

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

function addBook() {
    const textTitle = document.getElementById('bookFormTitle').value;
    const textAuthor = document.getElementById('bookFormAuthor').value;
    const textYear = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (isNaN(textYear)) {
        alert('Year must be a valid number!');
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    
    // Reset Form
    document.getElementById('bookForm').reset();
    document.getElementById('bookFormSection').classList.add('hidden');
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    // Clear Existing Content
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    // Count Books For Badges
    let unreadCount = 0;
    let readCount = 0;

    if (books.length === 0) {
        // Show Empty States
        incompleteBookList.innerHTML = `
            <div class="empty-state text-center py-10">
                <i class="fas fa-book-open text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No unread books yet</p>
                <p class="text-sm text-gray-400 mt-1">Add some books to get started!</p>
            </div>
        `;
        
        completeBookList.innerHTML = `
            <div class="empty-state text-center py-10">
                <i class="fas fa-check-circle text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No completed books yet</p>
                <p class="text-sm text-gray-400 mt-1">Mark books as read when you finish them!</p>
            </div>
        `;
    } else {
        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isComplete) {
                incompleteBookList.append(bookElement);
                unreadCount++;
            } else {
                completeBookList.append(bookElement);
                readCount++;
            }
        }
    }

    // Update Counters
    document.getElementById('unreadCount').textContent = unreadCount;
    document.getElementById('readCount').textContent = readCount;
});

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

function removeBookFromCompleted(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        const bookTarget = findBookIndex(bookId);

        if (bookTarget === -1) return;

        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function searchBooks(title) {
    const searchResults = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    return searchResults;
}

function renderSearchResults(searchResults) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    let unreadCount = 0;
    let readCount = 0;

    if (searchResults.length === 0) {
        incompleteBookList.innerHTML = `
            <div class="empty-state text-center py-10">
                <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No books found</p>
                <p class="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
        `;
    } else {
        for (const book of searchResults) {
            const bookElement = makeBook(book);
            if (book.isComplete) {
                completeBookList.append(bookElement);
                readCount++;
            } else {
                incompleteBookList.append(bookElement);
                unreadCount++;
            }
        }
    }

    document.getElementById('unreadCount').textContent = unreadCount;
    document.getElementById('readCount').textContent = readCount;
}

document.addEventListener('DOMContentLoaded', function () {
    // Form Toggle Functionality
    const toggleForm = document.getElementById('toggleForm');
    const bookFormSection = document.getElementById('bookFormSection');
    const closeForm = document.getElementById('closeForm');
    
    toggleForm.addEventListener('click', function() {
        bookFormSection.classList.toggle('hidden');
    });
    
    closeForm.addEventListener('click', function() {
        bookFormSection.classList.add('hidden');
    });

    // Form Submission
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    // Search Functionality
    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('searchBookTitle').value;
        const searchResults = searchBooks(title);
        renderSearchResults(searchResults);
    });

    // Clear Search When Empty
    const searchInput = document.getElementById('searchBookTitle');
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log('Data saved to localStorage');
});
