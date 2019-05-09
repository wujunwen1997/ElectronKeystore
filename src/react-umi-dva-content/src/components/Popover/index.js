import React, {PureComponent} from 'react'
import { Popover } from 'antd';
import PropTypes from 'prop-types';

class PopoverComponents extends PureComponent {
  state = {
    hovered: false
  };

  handleHoverChange = (visible) => {
    this.setState({
      hovered: visible,
      clicked: false,
    });
  }
  render() {
    const {children, text} = this.props
    const hoverContent = (
      <div>{text}</div>
    );
    return (
      <Popover
        style={{ width: 500 }}
        content={hoverContent}
        trigger="hover"
        visible={this.state.hovered}
        onVisibleChange={this.handleHoverChange}
      >
          {children}
      </Popover>
    )
  }
}
PopoverComponents.propTypes = {
  children: PropTypes.element.isRequired,
  text: PropTypes.string
};
export default PopoverComponents
