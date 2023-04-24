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
		intervalId: '',
	};

	componentDidMount() {
		this.api.loadData().then((data) => {
			this.setState({
				tasks: data,
			});
			this.sortTasks(data);
			this.hideDeletedTasks();
		});
	}

	componentWillUnmount() {
		this.stopIncrementTime();
	}

	render() {
		return (
			<>
				<h1 onClick={this.onClick}>TasksManager</h1>
				<section>
					<form onSubmit={this.handleSubmit}>
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

	renderTasksList() {
		const { tasks } = this.state;
		return tasks.map((task) => {
			return (
				<section>
					<header>
						{task.name}, {this.convertTime(task.time)}
					</header>
					<footer>
						<button onClick={() => this.handleStartStop(task.id)}>
							start/stop
						</button>
						<button onClick={() => this.handleFinish(task.id)}>
							zakończone
						</button>
						<button
							onClick={() => {
								this.handleRemove(task.id);
							}}
							disabled={!task.isDone}>
							usuń
						</button>
					</footer>
				</section>
			);
		});
	}

	handleSubmit = (e) => {
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
				const newTask = resp;
				this.setState((state) => {
					return {
						tasks: [...state.tasks, newTask],
					};
				});
			}
		});
	}

	handleStartStop(id) {
		this.state.tasks.map((task) => {
			if (task.id === id) {
				const { isRunning, isDone } = task;

				if (!isDone) {
					if (!isRunning) {
						this.api
							.updateData(id, { ...task, isRunning: true })
							.then((resp) => {
								if (resp) {
									this.incrementTime(id, task);
									this.changeState(id, { isRunning: true });
								}
							});
					} else {
						this.api
							.updateData(id, { ...task, isRunning: false })
							.then((resp) => {
								if (resp) {
									this.stopIncrementTime();
									this.changeState(id, { isRunning: false });
								}
							});
					}
				}
			}
		});
	}

	incrementTime(id, task) {
		const { isDone } = task;

		if (!isDone) {
			this.intervalId = setInterval(() => {
				this.setState((state) => {
					const newTasks = state.tasks.map((task) => {
						if (task.id === id) {
							return { ...task, time: task.time + 1 };
						}

						return task;
					});

					return {
						tasks: newTasks,
					};
				});
			}, 1000);
		}
	}

	stopIncrementTime() {
		clearInterval(this.intervalId);
	}

	handleFinish(id) {
		this.state.tasks.map((task) => {
			if (task.id === id) {
				this.api
					.updateData(id, { ...task, isDone: true, isRunning: false })
					.then((resp) => {
						if (resp) {
							this.changeState(id, { isDone: true, isRunning: false });
							this.stopIncrementTime();
						}
					});
			}
		});
	}

	handleRemove(id) {
		this.state.tasks.map((task) => {
			if (task.id === id) {
				const { isDone } = task;

				if (isDone) {
					this.api.updateData(id, { ...task, isRemoved: true }).then((resp) => {
						if (resp) {
							this.changeState(id, { isRemoved: true });
							this.hideDeletedTasks();
						}
					});
				}
			}
		});
	}

	hideDeletedTasks() {
		this.setState((state) => {
			const newTasks = state.tasks.filter((task) => {
				if (!task.isRemoved) {
					return task;
				}
			});

			return {
				tasks: newTasks,
			};
		});
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

	sortTasks(tasksArr) {
		tasksArr.sort((a, b) => {
			return a.isDone - b.isDone;
		});
	}

	convertTime(time) {
		let hours = Math.floor(time / 3600);
		let minutes = Math.floor((time - hours * 3600) / 60);
		let seconds = time % 60;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		if (hours < 10) {
			hours = '0' + hours;
		}

		return `${hours}:${minutes}:${seconds}`;
	}

	changeState(id, propertyToChange) {
		this.setState((state) => {
			const newTasks = state.tasks.map((task) => {
				if (task.id === id) {
					return { ...task, ...propertyToChange };
				}
				return task;
			});

			this.sortTasks(newTasks);

			return {
				tasks: newTasks,
			};
		});
	}
}

export default TasksManager;
