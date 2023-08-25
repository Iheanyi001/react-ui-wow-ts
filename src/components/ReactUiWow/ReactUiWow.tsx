import React  from "react";

interface ButtonProps{
  label:string
}
const ReactUiWow = (props: ButtonProps) =>{
  return <button>{props.label}</button>
}

export default ReactUiWow