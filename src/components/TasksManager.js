import React from 'react';
import API from './API';

class TasksManager extends React.Component {
	constructor() {
		super();
		this.api = new API();
	}

	state = {
		tasks: [],
		task: '',
	};

	componentDidMount() {
		this.api.loadData().then((data) => {
			this.setState({
				tasks: data,
			});
		});
	}

	render() {
		return (
			<>
				<h1 onClick={this.onClick}>TasksManager</h1>
				<section>
					<form onSubmit={this.submitHandler}>
						<label>Nazwa: </label>
						<input
							name='task'
							value={this.state.task}
							onChange={this.inputChange}
						/>

						<input type='submit' />
					</form>
					<ul> {this.renderTasksList()}</ul>
				</section>
			</>
		);
	}

	onClick = () => {
		const { tasks } = this.state;
		console.log(tasks);
	};

	inputChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value,
		});
	};

	renderTasksList() {
		const { tasks } = this.state;
		return tasks.map((task) => {
			return (
				<section>
					<header>{task.name}, 00:00:00</header>
					<footer>
						<button>start/stop</button>
						<button>zakończone</button>
						<button disabled='true'>usuń</button>
					</footer>
				</section>
			);
		});
	}

	submitHandler = (e) => {
		e.preventDefault();

		const { task } = this.state;
		if (task) {
			this.addTask(task);
		} else {
			alert('Wprowadź treść zadania!');
		}
	};

	addTask(taskName) {
		const data = {
			name: taskName,
			time: 0,
			isRunning: false,
			isDone: false,
			isRemoved: false,
		};

		this.api.addData(data).then((resp) => {
			if (resp.id) {
				this.addTaskToState(resp);
			}
		});
	}

	addTaskToState(task) {
		const newItem = task;

		this.setState((state) => {
			return {
				tasks: [...state.tasks, newItem],
			};
		});
	}
}

export default TasksManager;
