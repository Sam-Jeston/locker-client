import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { example } from './services'

export class App extends React.Component {
  componentDidMount() {
    example()
  }

  render() {
    return (
      <h1>TODO</h1>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
