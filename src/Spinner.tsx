import React from 'react';
import styled from 'styled-components';

type Props = {
  show: boolean,
  className: string
}
const Spinner: React.FC<Props> = (props) => {

  return (
    <div className={props.className} ></div>
  )
};

export default styled(Spinner)`
left:${props => window.innerWidth / 2 - 50 + "px"};
top:${props => window.innerHeight / 2 - 50 + "px"};
display:${props => props.show ? "block" : "none"};
border-radius: 50%;
  width: 100px;
  height: 100px;
  margin: 60px auto;
  font-size: 10px;
  position: fixed;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(169,169,169, 0.2);
  border-right: 1.1em solid rgba(169,169,169, 0.2);
  border-bottom: 1.1em solid rgba(169,169,169, 0.2);
  border-left: 1.1em solid #a9a9a9;
  
  transform: translateZ(0);
 
  animation: load8 1.1s infinite linear;


@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`;