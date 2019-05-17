# react-native-mswiper

轮播图

### 1.Installation

`npm i react-native-mswiper --save`

### 2.How to use
* Import
`import MSwiper from 'react-native-mswiper';`


```
1.initialization
  renderItem(){
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