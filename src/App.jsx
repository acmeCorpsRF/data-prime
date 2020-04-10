import React, {Component} from 'react';
import './App.scss';
import Sphere from './components/Sphere/Sphere';
import {Provider} from 'react-redux';
import initStore from './utils/store';

export default class App extends Component {

    render() {
        return (
            <Provider store={initStore()}>
                <div className="container">
                    <Sphere/>
                </div>
            </Provider>
        )
    }
}
