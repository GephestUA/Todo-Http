class TodoController {
	constructor (model,view) {
		this.model = model;
		this.view = view;
		this.view.render()

		this.view.subscribe(({name, type, id}) => {

			if (type === 'add') {
				fetch('http://localhost:8800/todos', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(new TodoItem(name))
				})
					.then(res => res.json())
					.then(data => {
						model.addTodo(new TodoItem(data.name, data.id))
						this.view.render()
					});
			} else if(type === 'remove') {
				fetch('http://localhost:8800/todos', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: id,
					})
				})
				.then(model.removeTodoById(id))
			} else if (type === 'update') {
				fetch('http://localhost:8800/todos', {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: id,
						completed: true,
					})
				})
				.then(model.toggleCompleted(id))
			} else if (type === 'edit') {
				fetch('http://localhost:8800/todos', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: id,
						title: name,
					})
				})
				.then(model.updateNameById(id,name))
			}
			
			this.view.render()
		});
	}
}

class TodoItem {
	constructor(name, someId, completed = false) {
		this.name = name;
		this.completed = completed;
		this.id = someId;
	}

	togle() {
		this.completed = !this.completed
	}
};

class TodoModel {
	constructor () {
		this.state = [];
	}

	addTodo(todo) {
		this.state.push(todo);
	}

	removeTodoById(id) {
		this.state = this.state.filter(todo => todo.id !== id);
	}

	updateNameById(id,name) {
		const todo = this.state.find(todo => todo.id === id);
		if (todo) {
			todo.name = name;
		}
	}

	toggleCompleted(id) {
		const todo = this.state.find(todo => todo.id === id);
		if(todo) {
			todo.togle()
		}
	}

	getState() {
		return this.state;
	}
};

class TodoView {
	constructor(moadel, container) {
		this.moadel = moadel;
		this.container = container;
		
		this.subribers = [];
		this.handleTodoAdd= this.handleTodoAdd.bind(this);
		this.handleTodoRemove = this.handleTodoRemove.bind(this);
		this.handleEditTask = this.handleEditTask.bind(this);
		this.innitialRender()
	}

	subscribe(subscriber) {
		this.subribers.push(subscriber)
	}

	notify (data) {
		this.subribers.forEach(cb => cb(data))
	}

	handleTodoAdd(event) {
		event.preventDefault();

		this.notify({
			name: this.input.value,
			type: 'add'
		})

		this.input.value = '';
	}
	
	handleEditTask (event)  {
		const task = event.target.closest('.todo-item-name');
		if(task) {
			this.notify({
				id: Number(task.closest('.todo-item').dataset.id),
				name: task.value,
				type: 'edit',
			})
		}
	};

	handleTodoRemove(event) {
		const removeBtn = event.target.closest('.todo-remove-btn');
		const checkbox = event.target.closest('.todo-item-checkbox');
		
		if (removeBtn) {
			this.notify({
				id: Number(removeBtn.closest('.todo-item').dataset.id),
				type: 'remove'
			})
		}

		if (checkbox) {
			this.notify({
				id: Number(checkbox.closest('.todo-item').dataset.id),
				type: 'update'
			})
		}
	};

	innitialRender() {
		this.container.innerHTML = `
		<div class="todo-app">
			<form class="todo-form">
				<input type="text">
				<button>create</button>
			</form>
			<ul class="todo-list"></ul>
		</div>`	
		this.todoList = this.container.querySelector('.todo-list');
		this.todoForm = this.container.querySelector('.todo-form');
		this.input = this.container.querySelector('.todo-form input');

		this.todoForm.addEventListener('submit', this.handleTodoAdd);
		this.todoList.addEventListener('click', this.handleTodoRemove);
		this.todoList.addEventListener('blur', this.handleEditTask, true);
	}
	
	render() {
		this.todoList.innerHTML = null;
		this.moadel.getState().forEach(todo => {
			const todoElement = `
			<div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
				<input type="checkbox" class="todo-item-checkbox" ${todo.completed ? 'checked' : ''}>
				<input class="todo-item-name" type="text" value="${todo.name}"></input>
				<button class="todo-remove-btn">X</button>
			</div>`
			
			this.todoList.innerHTML += todoElement;
		});
	}
};


let model = new TodoModel();
let view = new TodoView(
	model,
	document.getElementById('todo-container')
);

const control = new TodoController(model,view);