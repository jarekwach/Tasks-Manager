import React from 'react';
import { createRoot } from 'react-dom/client';

import TasksManager from './components/TasksManager';

import './styles/css/reset.css'
import './styles/css/main.css';

const App = () => <TasksManager />;

const root = createRoot(document.querySelector('#root'));
root.render(<App />);
