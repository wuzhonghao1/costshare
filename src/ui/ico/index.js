import React from 'react'
import './iconfont/iconfont.css'

export default class Ico extends  React.Component{
  ref = React.createRef()
  render(){
    const {className='', style={}, type, onClick=()=>{}} = this.props
    return(<i className={`crmico crmico-${type} ${className}`} style={style} onClick={onClick} ref={this.ref} /> )
  }
}