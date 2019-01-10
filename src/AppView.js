import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import store from 'src/store';
import DropdownHolder from 'src/components/DropdownAlert/holder';
import NavigationService from 'src/modules/navigation/NavigationService';
import AppNavigator from 'src/modules/navigation/AppNavigator';
import { getRequestStatuses } from 'src/reducers/global/requestStatus/selectors';

function getActiveRoute(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRoute(route);
  }

  return route;
}

class AppView extends Component {
  componentWillReceiveProps(nextProps) {
    const { loading } = this.props;
    const { errors, loaded } = nextProps;

    Object.keys(loading).forEach(key => {
      if (errors[key]) {
        DropdownHolder.alert('error', errors[key].message);
      } else if (loaded[key]) {
        DropdownHolder.alert('success', loaded[key]);
      }
    });
  }

  render() {
    return (
      <AppNavigator
        ref={navigatorRef => { NavigationService.setTopLevelNavigator(navigatorRef); }}
        onNavigationStateChange={(prevState, newState) => {
          const currentScreen = getActiveRoute(newState);
          const prevScreen = getActiveRoute(prevState);

          if (prevScreen !== currentScreen) {
            store.dispatch({
              type: 'NAVIGATION',
              payload: {
                currentScreen: currentScreen.routeName,
                requestId: currentScreen.params && currentScreen.params.requestId,
              },
            })
          }
        }}
      />
    );
  }
}

const mapStateToProps = state => {
  return getRequestStatuses(state);
};

const mapActionsToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(AppView);