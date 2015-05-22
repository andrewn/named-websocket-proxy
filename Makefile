
BUILD_DIR:=$(shell mktemp -d -t tmp.electron-build)
ARCH=darwin-x64
ZIP_PATH=$(BUILD_DIR)/electron.zip
UNZIP_PATH=$(BUILD_DIR)

build: download_binary copy_app

download_binary:
	@echo 'Build dir: $(BUILD_DIR)'
	mkdir -p $(UNZIP_PATH)
	wget --output-document=$(ZIP_PATH) https://github.com/atom/electron/releases/download/v0.26.1/electron-v0.26.1-$(ARCH).zip
	unzip -d $(UNZIP_PATH) $(ZIP_PATH)
	rm $(ZIP_PATH)

copy_app:
	cp -R . $(UNZIP_PATH)/Electron.app/Contents/Resources/app
	mv $(UNZIP_PATH)/Electron.app dist/