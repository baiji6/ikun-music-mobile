#import "UtilsModule.h"
#import <UIKit/UIKit.h>
#import <SystemConfiguration/CaptiveNetwork.h>
#import <UserNotifications/UserNotifications.h>

@implementation UtilsModule
{
  bool hasListeners;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    hasListeners = NO;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"screen-state", @"screen-size-changed"];
}

- (void)startObserving
{
  hasListeners = YES;
}

- (void)stopObserving
{
  hasListeners = NO;
}

#pragma mark - exitApp

RCT_EXPORT_METHOD(exitApp)
{
  // iOS doesn't support programmatic exit, suspend the app
  dispatch_async(dispatch_get_main_queue(), ^{
    UIControl *control = [[UIControl alloc] init];
    [control sendAction:@selector(suspend) to:[UIApplication sharedApplication] forEvent:nil];
  });
}

#pragma mark - getSupportedAbis

RCT_EXPORT_METHOD(getSupportedAbis:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@[@"arm64"]);
}

#pragma mark - installApk (not supported on iOS)

RCT_EXPORT_METHOD(installApk:(NSString *)filePath
                  fileProviderAuthority:(NSString *)fileProviderAuthority
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  reject(@"UtilsModule", @"installApk is not supported on iOS", nil);
}

#pragma mark - screenkeepAwake

RCT_EXPORT_METHOD(screenkeepAwake)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [UIApplication sharedApplication].idleTimerDisabled = YES;
  });
}

RCT_EXPORT_METHOD(screenUnkeepAwake)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [UIApplication sharedApplication].idleTimerDisabled = NO;
  });
}

#pragma mark - getWIFIIPV4Address

RCT_EXPORT_METHOD(getWIFIIPV4Address:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // iOS doesn't allow easy access to WiFi IP without special entitlements
  // Return a placeholder for now
  resolve(@"0.0.0.0");
}

#pragma mark - getDeviceName

RCT_EXPORT_METHOD(getDeviceName:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *deviceName = [[UIDevice currentDevice] name];
  resolve(deviceName ?: @"Unknown");
}

#pragma mark - isNotificationsEnabled

RCT_EXPORT_METHOD(isNotificationsEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (@available(iOS 10.0, *)) {
    [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
      BOOL enabled = (settings.authorizationStatus == UNAuthorizationStatusAuthorized ||
                      settings.authorizationStatus == UNAuthorizationStatusProvisional);
      resolve(@(enabled));
    }];
  } else {
    resolve(@(NO));
  }
}

#pragma mark - openNotificationPermissionActivity

RCT_EXPORT_METHOD(openNotificationPermissionActivity:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (@available(iOS 10.0, *)) {
      NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
      if ([[UIApplication sharedApplication] canOpenURL:url]) {
        [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:^(BOOL success) {
          resolve(@(success));
        }];
      } else {
        resolve(@(NO));
      }
    } else {
      resolve(@(NO));
    }
  });
}

#pragma mark - shareText

RCT_EXPORT_METHOD(shareText:(NSString *)shareTitle
                  title:(NSString *)title
                  text:(NSString *)text)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIActivityViewController *activityVC = [[UIActivityViewController alloc]
      initWithActivityItems:@[text] applicationActivities:nil];
    
    UIViewController *rootVC = [UIApplication sharedApplication].keyWindow.rootViewController;
    if (rootVC) {
      [rootVC presentViewController:activityVC animated:YES completion:nil];
    }
  });
}

#pragma mark - getSystemLocales

RCT_EXPORT_METHOD(getSystemLocales:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSLocale *locale = [NSLocale currentLocale];
  NSString *languageCode = [locale languageCode];
  NSString *countryCode = [locale countryCode];
  
  NSString *localeStr;
  if (countryCode.length > 0) {
    localeStr = [NSString stringWithFormat:@"%@_%@", [languageCode lowercaseString], [countryCode lowercaseString]];
  } else {
    localeStr = [languageCode lowercaseString];
  }
  
  resolve(localeStr);
}

#pragma mark - getWindowSize

RCT_EXPORT_METHOD(getWindowSize:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    if (!window) {
      window = [UIApplication sharedApplication].windows.firstObject;
    }
    
    if (window) {
      CGRect bounds = window.bounds;
      CGFloat scale = [[UIScreen mainScreen] scale];
      resolve(@{
        @"width": @(bounds.size.width * scale),
        @"height": @(bounds.size.height * scale)
      });
    } else {
      CGRect bounds = [[UIScreen mainScreen] bounds];
      CGFloat scale = [[UIScreen mainScreen] scale];
      resolve(@{
        @"width": @(bounds.size.width * scale),
        @"height": @(bounds.size.height * scale)
      });
    }
  });
}

#pragma mark - listenWindowSizeChanged

RCT_EXPORT_METHOD(listenWindowSizeChanged)
{
  // iOS doesn't have a simple window size change listener like Android
  // The JS side uses Dimensions API for this
}

@end