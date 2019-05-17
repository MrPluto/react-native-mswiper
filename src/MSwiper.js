/**
 * Created by pluto on 19/5/17.
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  Platform,
  InteractionManager,
  ViewPagerAndroid
} from 'react-native';

const { width } = Dimensions.get('window');
const DOT_SIZE = 8;

const enhanceData = (data = []) => {
  let edata = [];
  if (data.length === 1) {
    edata = data;
  } else {
    edata = [data[data.length - 1], ...data, data[0]];
  }
  return edata;
};

class MSwiper extends Component {
  defaultProps = {
    dotHighlightColor: 'red',
    dotColor: 'white',
    autoplay: true
  };
  constructor(props) {
    super(props);
    let data = enhanceData(this.props.data);
    this.state = {
      currentIndex: 1,
      data: data
    };
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (this.props.autoplay) {
        this.startTimer();
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this.setState({ data: enhanceData(nextProps.data) });
      this.stopTimer();
    }
  }
  componentWillUnmount() {
    this._timer && clearInterval(this._timer);
  }
  componentDidUpdate(prevProps, prevState) {
    this.startTimer();
  }

  _currentIndex = 0;
  startTimer = () => {
    // return;
    this.stopTimer();
    // return;
    if (this.state.data.length === 1) {
      return;
    }
    let delay = this.props.delay || 4000;
    this._timer = setInterval(() => {
      this._currentIndex++;
      //保护下
      if (this._currentIndex < this.state.data.length) {
        if (Platform.OS === 'android') {
          this._androidSwiper &&
            this._androidSwiper.setPage(this._currentIndex);
        } else {
          this._list &&
            this._list.scrollToIndex({
              viewPosition: 0,
              index: this._currentIndex
            });
        }
      }

      this._delayTimer = setTimeout(() => {
        if (Platform.OS === 'android') {
          this.resetIndexAndroid();
        } else {
          this.resetPositionIfNeed();
        }
      }, 300);
    }, delay);
  };
  stopTimer = () => {
    this._timer && clearInterval(this._timer);
    this._delayTimer && clearInterval(this._delayTimer);
  };
  resetPositionIfNeed = () => {
    if (this._currentIndex === this.state.data.length - 1) {
      this._currentIndex = 1;
      this._list &&
        this._list.scrollToOffset({ offset: width, animated: false });
    }
    if (this._currentIndex === 0) {
      this._currentIndex = this.state.data.length - 2;
      this._list &&
        this._list.scrollToOffset({
          offset: width * this._currentIndex,
          animated: false
        });
    }
    this.setState({ currentIndex: this._currentIndex });
  };
  xOffset = width;
  onScroll = e => {
    // let x = e.nativeEvent.contentOffset.x;
    // this.xOffset = x || 0;
  };
  onMomentumScrollEnd = e => {
    if (this.state.data.length === 1) {
      return;
    }

    let x = e.nativeEvent.contentOffset.x;
    let index = Math.round(x / width);

    this._currentIndex = index;
    this.resetPositionIfNeed();
    this.startTimer();
  };
  onScrollBeginDrag = e => {
    this.stopTimer();
  };
  onScrollEndDrag = e => {};
  renderItem({ item, index }) {
    if (this.props.renderItem) {
      return <View key={index}>{this.props.renderItem({ item, index })}</View>;
    }
    return (
      <View key={index} style={styles.item}>
        <Text style={{ color: 'white' }}>{index}</Text>
      </View>
    );
  }
  dots = [];
  renderDots() {
    if (this.props.hideDots) {
      return;
    }
    if (this.state.data.length <= 1) {
      return null;
    } else {
      let lastIndex = this.state.data.length - 1;
      return (
        <View style={styles.dots}>
          {this.state.data.map((item, index) => {
            let color =
              index === 0 || index === lastIndex
                ? 'transparent'
                : this.props.dotColor;
            if (this.state.currentIndex === index) {
              color = this.props.dotHighlightColor;
            }
            return (
              <View
                key={'dot' + index}
                style={[styles.dot, { backgroundColor: color }]}
              />
            );
          })}
        </View>
      );
    }
  }
  resetIndexAndroid = () => {
    let lastIndex = this.state.data.length - 1;
    if (this._currentIndex === lastIndex) {
      this._currentIndex = 1;
    }
    if (this._currentIndex === 0) {
      this._currentIndex = lastIndex - 1;
    }
    // console.log('resetIndexAndroid',this._currentIndex);
    this._androidSwiper &&
      this._androidSwiper.setPageWithoutAnimation(this._currentIndex);
    this.setState({ currentIndex: this._currentIndex });
  };
  onPageSelected = e => {
    let positionIndex = e.nativeEvent.position;
    // console.log('onPageSelected',positionIndex);
    this._currentIndex = positionIndex;
    this.resetIndexAndroid();
  };
  onPageScrollStateChanged = state => {
    // console.log('onPageScrollStateChanged',state);
    if (state === 'idle') {
      if (!this._timer) {
        this.startTimer();
      }
    } else if (state === 'dragging') {
      this.stopTimer();
    }
  };
  renderMain() {
    if (Platform.OS === 'android') {
      return (
        <ViewPagerAndroid
          onPageScrollStateChanged={this.onPageScrollStateChanged}
          style={{ width: width, height: width / this.props.ratio }}
          ref={el => (this._androidSwiper = el)}
          renderItem={this.renderItem}
          initialPage={this.state.data.length === 1 ? 0 : 1}
          onPageSelected={this.onPageSelected}
          data={this.state.data}
        >
          {this.state.data.map((item, index) => {
            return this.renderItem({ item, index });
          })}
        </ViewPagerAndroid>
      );
    }
    return (
      <FlatList
        ref={el => (this._list = el)}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index
        })}
        // onScroll={this.onScroll}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScrollBeginDrag={this.onScrollBeginDrag}
        onScrollEndDrag={this.onScrollEndDrag}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        initialScrollIndex={this.state.data.length === 1 ? 0 : 1}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={this.props.keyExtractor}
        // keyExtractor={(item, index) => index}
      />
    );
  }
  render() {
    return (
      <View style={[styles.main, this.props.style]}>
        {this.renderMain()}
        {this.renderDots()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    width,
    backgroundColor: 'transparent'
  },
  scroll: {},
  item: {
    width,
    height: 20,
    backgroundColor: 'transparent'
  },
  dots: {
    position: 'absolute',
    bottom: 15,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'white',
    marginHorizontal: 3
  }
});

export default MSwiper;
