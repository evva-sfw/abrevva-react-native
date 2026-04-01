#include <jni.h>
#include "abrevvareactnativeOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::abrevvareactnative::initialize(vm);
}
