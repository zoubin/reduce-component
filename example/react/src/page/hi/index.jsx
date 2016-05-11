var React = require('react');
var earth = require('earth');

var Hi = React.createClass({
  displayName: 'Hi',
  render() {
    return (
      <div className="commentBox">
        Hi, {earth}!
      </div>
    );
  }
});

export default Hi;
