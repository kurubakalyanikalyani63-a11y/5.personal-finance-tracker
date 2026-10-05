let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transactionForm");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const transactionList = document.getElementById("transactionList");

const search = document.getElementById("search");
const filterType = document.getElementById("filterType");

// Set today's date
date.value = new Date().toISOString().split("T")[0];

form.addEventListener("submit", function(e) {

    e.preventDefault();

    const transaction = {
        id: Date.now(),
        description: description.value,
        amount: Number(amount.value),
        type: type.value,
        category: category.value,
        date: date.value
    };

    transactions.push(transaction);

    saveData();
    updateUI();

    form.reset();
    date.value = new Date().toISOString().split("T")[0];
});

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function updateUI() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    const balance = income - expense;

    incomeDisplay.textContent = formatCurrency(income);
    expenseDisplay.textContent = formatCurrency(expense);
    balanceDisplay.textContent = formatCurrency(balance);

    displayTransactions();
}

function displayTransactions() {

    const searchText = search.value.toLowerCase();
    const selectedType = filterType.value;

    transactionList.innerHTML = "";

    const filtered = transactions.filter(transaction => {

        const matchesSearch =
            transaction.description
                .toLowerCase()
                .includes(searchText) ||
            transaction.category
                .toLowerCase()
                .includes(searchText);

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
        transactionList.innerHTML =
            "<p style='text-align:center;color:#777;'>No transactions found.</p>";
        return;
    }

    filtered
        .slice()
        .reverse()
        .forEach(transaction => {

            const div = document.createElement("div");

            div.className =
                `transaction ${transaction.type}`;

            const sign =
                transaction.type === "income" ? "+" : "-";

            div.innerHTML = `
                <div class="transaction-info">
                    <h3>${escapeHTML(transaction.description)}</h3>
                    <small>
                        ${escapeHTML(transaction.category)}
                        • ${transaction.date}
                    </small>
                </div>

                <div>
                    <span class="amount">
                        ${sign}${formatCurrency(transaction.amount)}
                    </span>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">
                        Delete
                    </button>
                </div>
            `;

            transactionList.appendChild(div);
        });
}

function deleteTransaction(id) {

    transactions =
        transactions.filter(transaction => transaction.id !== id);

    saveData();
    updateUI();
}

function clearAll() {

    if (transactions.length === 0) {
        return;
    }

    if (confirm("Are you sure you want to delete all transactions?")) {

        transactions = [];

        saveData();
        updateUI();
    }
}

function formatCurrency(value) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(value);
}

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

search.addEventListener("input", displayTransactions);
filterType.addEventListener("change", displayTransactions);

updateUI();