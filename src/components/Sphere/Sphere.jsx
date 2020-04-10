import React, {Component} from 'react';
import './Sphere.scss';
import {
    loadingUsers,
    settingPointsDisplayed,
    updateUsersPoints,
    settingSignaturesDisplayed,
    updateUsersSignatures
} from "../../actions/sphereActions";
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import connect from 'react-redux/es/connect/connect';
import '../../js/3d-word-cloud/jquery.svg3dtagcloud.js'

let svg3DTagCloud;

class Sphere extends Component {

    static propTypes = {
        loadingUsers: PropTypes.func.isRequired,
        settingPointsDisplayed: PropTypes.func.isRequired,
        updateUsersPoints: PropTypes.func.isRequired,
        settingSignaturesDisplayed: PropTypes.func.isRequired,
        updateUsersSignatures: PropTypes.func.isRequired,
        entries: PropTypes.array.isRequired
    };

    componentDidUpdate() {
        const {entries} = this.props;
        const settings = {
            entries: entries,
            width: 600,
            height: 600,
            radius: '50%',
            radiusMin: 75,
            bgDraw: false,
            bgColor: 'transparent',
            opacityOver: 1.00,
            opacityOut: 0.05,
            opacitySpeed: 6,
            fov: 800,
            speed: 0.5,
            fontFamily: 'Roboto, Oswald, Arial, sans-serif',
            fontSize: '16',
            fontColor: '#000000',
            linkClass: '',
            hover: true,
            click: false
        };
        if(svg3DTagCloud) {
            svg3DTagCloud.destroy();
        }
        svg3DTagCloud = new SVG3DTagCloud(document.getElementById('users'), settings);
    }

    componentDidMount() {
        const {loadingUsers} = this.props;
        fetch('../../../api/generated.json')
            .then(response => response.json())
            .then(response => {
                loadingUsers(response);
            });
    }

    handleClickPoints = (target) => {
        const {settingPointsDisplayed, updateUsersPoints} = this.props;
        settingPointsDisplayed(target);
        updateUsersPoints();
    };

    handleClickSignatures = (target) => {
        const {settingSignaturesDisplayed, updateUsersSignatures} = this.props;
        settingSignaturesDisplayed(target);
        updateUsersSignatures();
    };

    render() {
        return (
            <div className="sphere" id="sphere">
                <div className="settings">
                    <div className="number-points-displayed">
                        <label>
                            Количество отображаемых точек
                            <input className="settings__input" type="number" min="0"/>
                        </label>
                        <button className="settings__button" onClick={e => this.handleClickPoints(e.target)}>
                            &gt;
                        </button>
                    </div>
                    <div className="number-signatures-displayed">
                        <label>
                            Количество отображаемых подписей
                            <input className="settings__input" type="number" min="0"/>
                        </label>
                        <button className="settings__button" onClick={e => this.handleClickSignatures(e.target)}>
                            &gt;
                        </button>
                    </div>
                </div>
                <div className="users" id="users"></div>
            </div>
        )
    }

}

const mapStateToProps = ({sphereReducer}) => ({
    users: sphereReducer.users,
    entries: sphereReducer.entries
});
const mapDispatchToProps = dispatch => bindActionCreators({
    loadingUsers,
    settingPointsDisplayed,
    updateUsersPoints,
    settingSignaturesDisplayed,
    updateUsersSignatures
}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Sphere);