const Modal = {
    toggle() {
        document.querySelector(".modal-overlay").classList.toggle('active');
    },
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)
        App.reload();
    },

    remove(id) {
        this.all.splice(this.all.findIndex(e => e.id == id), 1);
        App.reload();
    },

    getNextId() {
        const lastIndex = this.all.length > 0 ? this.all.length - 1 : this.all.length;
        return this.all.length > 0 ? this.all[lastIndex].id + 1 : 1;
    },

    incomes() {
        let income = 0;
        this.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        this.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        let total = 0;
        this.all.forEach(transaction => {
            total += transaction.amount;
        })
        return total;
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = this.innerHTMLTransaction(transaction);
        tr.dataset.index = index;
        this.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction({ id, description, amount, date }) {
        const CSSclass = amount > 0 ? "income" : "expense";

        amount = Utils.formatCurrency(amount);

        const html = `
            <td class="description">${description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${date}</td>
            <td>
                <img onClick="Transaction.remove(${id})" src="./assets/minus.svg" alt="">
            </td>
        `
        return html;
    },
    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes());

        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },
    clearTransactions() {
        this.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100
        value = value.toLocaleString("pt-Br", { style: "currency", currency: "BRL" });
        return signal + value;
    },
    formatAmount(value) {
        value = value.replace(/\.?\,?/g) * 100;
        return value;
    },
    formatDate(date) {
        const [year, month, day] = date.split("-")

        return `${day}/${month}/${year}`;
    }
}

const Form = {
    description: document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date"),

    getValues() {
        return ({
            description: this.description.value.trim(),
            amount: this.amount.value.trim(),
            date: this.date.value.trim(),
        })
    },

    formatValues() {
        let { description, amount, date } = this.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        const id = Transaction.getNextId();

        return ({
            id,
            description,
            amount,
            date
        })
    },
    validateFields() {
        const { description, amount, date } = this.getValues();
        console.log(description);
        console.log(amount);
        console.log(date);

        if (description === "" || amount === "" || date === "") {
            throw new Error("Preencha todos os campos!");
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction);
    },
    clearFields() {
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },
    submit(event) {
        try {
            event.preventDefault();
            this.validateFields();
            const transaction = this.formatValues();
            this.saveTransaction(transaction);
            this.clearFields();
            Modal.toggle();
        } catch (e) {
            alert(e.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });

        DOM.updateBalance()

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        this.init();
    },
}


App.init();