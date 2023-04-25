import React from 'react';
import API from './API';

class TasksManager extends React.Component {
	constructor() {
		super();
		this.api = new API();
		this.intervalId = '';
	}

	state = {
		tasks: [],
		task: '',
	};

	componentDidMount() {
		this.api.load().then((data) => {
			this.sortTasks(data);

			this.setState({
				tasks: data,
			});
			this.hideDeletedTasks();
		});
	}

	componentWillUnmount() {
		this.stopIncrementTime();
	}

	render() {
		return (
			<section className='tasks-manager'>
				<div className='tasks-manager__container container'>
					<header className='tasks-manager__header'>
						<i className='tasks-manager__ico fa-solid fa-list-check'></i>
						<h1
							className='tasks-manager__title'
							onClick={this.onClick}>
							TasksManager
						</h1>
					</header>

					<form
						className='tasks-manager__form form'
						onSubmit={this.handleSubmit}>
						<label className='form__label'>Nazwa: </label>
						<input
							className='form__input'
							name='task'
							value={this.state.task}
							onChange={this.inputChange}
						/>

						<input
							className='form__submit-btn'
							type='submit'
						/>
					</form>

					<section className='tasks-manager__tasks tasks'>
						<ul className='tasks__list'> {this.renderTasksList()}</ul>
					</section>
				</div>
			</section>
		);
	}

	renderTasksList() {
		const { tasks } = this.state;
		return tasks.map((task) => {
			return (
				<li className='tasks__item task'>
					<header className='task__header'>
						<h3 className='task__title'>{task.name}</h3>
						<p className='task__time'>{this.convertTime(task.time)}</p>
					</header>
					<footer className='task__footer'>
						<button
							className={
								task.isRunning
									? 'task__btn task__btn--stop'
									: 'task__btn task__btn--start'
							}
							onClick={() => this.handleStartStop(task.id)}
							disabled={(this.intervalId && !task.isRunning) || task.isDone}>
							{task.isRunning ? 'stop' : 'start'}
						</button>
						<button
							className={task.isDone ? 'task__btn task__btn--finished' : 'task__btn task__btn--finish'}
							onClick={() => this.handleFinish(task.id)}
							disabled={task.isDone}>
							{task.isDone ? 'zakończone' : 'zakończ'}
						</button>
						<button
							className='task__btn task__btn--remove'
							onClick={() => {
								this.handleRemove(task.id);
							}}
							disabled={!task.isDone}>
							usuń
						</button>
					</footer>
				</li>
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

		this.api.add(data).then((resp) => {
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
				const { isRunning } = task;

				if (!isRunning) {
					this.api.update(id, { ...task, isRunning: true }).then((resp) => {
						if (resp) {
							this.incrementTime(id);
							this.changeState(id, { isRunning: true });
						}
					});
				} else {
					this.api.update(id, { ...task, isRunning: false }).then((resp) => {
						if (resp) {
							this.stopIncrementTime();
							this.changeState(id, { isRunning: false });
						}
					});
				}
			}
		});
	}

	incrementTime(id) {
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

	stopIncrementTime() {
		clearInterval(this.intervalId);
		this.intervalId = false;
	}

	handleFinish(id) {
		this.state.tasks.map((task) => {
			if (task.id === id) {
				this.api
					.update(id, { ...task, isDone: true, isRunning: false })
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
					this.api.update(id, { ...task, isRemoved: true }).then((resp) => {
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
