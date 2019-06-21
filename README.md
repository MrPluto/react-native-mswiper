# react-native-mswiper

轮播图

### 1.Installation

`npm i react-native-mmswiper --save`

### 2.How to use

`import MSwiper from 'react-native-mmswiper';`


```
1.initialization
  renderItem({item,index}){
    return (
      <View>
      {/*...*/}
      </View>
    )
  }
  render() {
    return (
      <View>
        <MSwiper
          autoplay
          data={data}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
```
