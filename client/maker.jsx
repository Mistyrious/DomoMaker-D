const helper = require('./helper.js');

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const level = e.target.querySelector('#domoLevel').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if(!name || !age || !level){
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, level, _csrf}, loadDomosFromServer);

    return false;
}

const handlePassChange = (e) => {
    e.preventDefault();
    helper.hideError();

    const oldPass = e.target.querySelector('#oldPass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if(!oldPass || !pass || !pass2){
        helper.handleError('All fields are required!');
        return pass;
    }

    if(pass !== pass2){
        helper.handleError('New passwords do not match!');
    }

    helper.sendPost(e.target.action, {oldPass, pass, pass2, _csrf});
}

const PassChangeForm = (props) => {
    return(
        <form id="changePassForm"
            onSubmit={handlePassChange}
            name="changePassForm"
            action="/changePass"
            method="POST"
            className="passForm"
        >
            <label htmlFor="oldPass">Current Password: </label>
            <input id="oldPass" type="password" name="oldPass" placeholder="password" />
            <label htmlFor="pass">New Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass2">Confirm New Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="password" />
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Update" />
        </form>
    );
}

const DomoForm = (props) => {
    return(
        <form id="domoForm"
            onSubmit={handleDomo}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" />
            <label htmlFor="level">Level: </label>
            <input id="domoLevel" type="number" min="0" max="100" name="level" />
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
}

const DomoList = (props) => {
    if(props.domos.length === 0){
        return(
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return(
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
                <h3 className="domoLevel">Level: {domo.level}</h3>
            </div>
        );
    });

    return(
        <div className="domoList">
            {domoNodes}
        </div>
    );
}

const loadDomosFromServer = async() => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(<DomoList domos={data.domos}/>, document.getElementById('domos'));
}

const init = async() => {
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(<DomoForm csrf={data.csrfToken} />, document.getElementById('makeDomo'));

    ReactDOM.render(<PassChangeForm csrf={data.csrfToken} />, document.getElementById('changePass'));

    ReactDOM.render(<DomoList domos={[]} />, document.getElementById('domos'));

    loadDomosFromServer();
}

window.onload = init;