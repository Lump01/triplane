#import <React/RCTViewManager.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <UIKit/UIKit.h>

@interface ARObjectScannerView : UIView
@property (nonatomic, copy) RCTBubblingEventBlock onNativeProgress;
@property (nonatomic, copy) RCTBubblingEventBlock onNativeError;
@property (nonatomic, copy) RCTBubblingEventBlock onNativeCompleted;
@end

@implementation ARObjectScannerView {
  UIView *_placeholder;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    self.backgroundColor = [UIColor colorWithWhite:0.95 alpha:1.0];
    _placeholder = [UIView new];
    _placeholder.backgroundColor = [UIColor colorWithWhite:0.9 alpha:1.0];
    _placeholder.layer.cornerRadius = 8;
    _placeholder.translatesAutoresizingMaskIntoConstraints = NO;
    UILabel *label = [UILabel new];
    label.text = @"ARKit scanner placeholder (link native AR implementation)";
    label.textAlignment = NSTextAlignmentCenter;
    label.numberOfLines = 0;
    label.translatesAutoresizingMaskIntoConstraints = NO;
    [_placeholder addSubview:label];
    [self addSubview:_placeholder];
    [NSLayoutConstraint activateConstraints:@[
      [_placeholder.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
      [_placeholder.trailingAnchor constraintEqualToAnchor:self.trailingAnchor],
      [_placeholder.topAnchor constraintEqualToAnchor:self.topAnchor],
      [_placeholder.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
      [label.centerXAnchor constraintEqualToAnchor:_placeholder.centerXAnchor],
      [label.centerYAnchor constraintEqualToAnchor:_placeholder.centerYAnchor],
      [label.leadingAnchor constraintGreaterThanOrEqualToAnchor:_placeholder.leadingAnchor constant:12],
      [label.trailingAnchor constraintLessThanOrEqualToAnchor:_placeholder.trailingAnchor constant:-12],
    ]];
  }
  return self;
}
@end

@interface ARObjectScannerViewManager : RCTViewManager
@end

@implementation ARObjectScannerViewManager

RCT_EXPORT_MODULE(ARObjectScannerView)

- (UIView *)view
{
  return [ARObjectScannerView new];
}

RCT_EXPORT_VIEW_PROPERTY(onNativeProgress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onNativeError, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onNativeCompleted, RCTBubblingEventBlock)

@end
