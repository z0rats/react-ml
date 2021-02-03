import React from 'react';

import SchoolIcon from '@material-ui/icons/School';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import MultilayerNN from './MultilayerNN';
import HopfieldNN from './HopfieldNN';
import '../css/App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
    };
  }

  handleChangeTab = (e, tabId) => {
    this.setState({ activeTab: tabId });
  };

  render() {
    const { activeTab } = this.state;

    return (
      <div className="App">
        <Paper square>
          <Tabs
            value={activeTab}
            onChange={this.handleChangeTab}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<SchoolIcon />} label="Многослойная НС" value={0} />
            <Tab icon={<SchoolIcon />} label="Нейросеть Хопфилда" value={1} />
          </Tabs>
        </Paper>
        {activeTab === 0 && (
          <MultilayerNN />
        )}
        {activeTab === 1 && (
          <HopfieldNN />
        )}
      </div>
    );
  }
}
