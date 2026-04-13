import UIKit
import WebKit

var webView: WKWebView! = nil

class ViewController: UIViewController, WKNavigationDelegate, UIDocumentInteractionControllerDelegate {

    var documentController: UIDocumentInteractionController?
    func documentInteractionControllerViewControllerForPreview(_ controller: UIDocumentInteractionController) -> UIViewController {
        return self
    }

    @IBOutlet weak var loadingView: UIView!
    @IBOutlet weak var loadingBackgroundView: UIView!
    @IBOutlet weak var logoImageView: UIImageView!
    @IBOutlet weak var connectionProblemView: UIImageView!
    @IBOutlet weak var webviewView: UIView!
    var toolbarView: UIToolbar!

    var htmlIsLoaded = false;

    private var loadingGradientLayer: CAGradientLayer?
    private var loadingAccentLayer: CAGradientLayer?
    private var scanlineReplicatorLayer: CAReplicatorLayer?
    private var scanlineSeedLayer: CALayer?
    private var glitchLayers: [UIImageView] = []
    private var loadingStatusLabel: UILabel?
    private let loadingTheme = LoadingTheme()
    private let glitchCycleDuration: CFTimeInterval = 2.5
    private let iframeDebugOverlayTag = 909401
    private var iframeDebugPollTimer: Timer?

    private var themeObservation: NSKeyValueObservation?
    var currentWebViewTheme: UIUserInterfaceStyle = .unspecified
    override var preferredStatusBarStyle : UIStatusBarStyle {
        if #available(iOS 13, *), overrideStatusBar{
            if #available(iOS 15, *) {
                return .default
            } else {
                return statusBarTheme == "dark" ? .lightContent : .darkContent
            }
        }
        return .default
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLoadingScreen()
        if iframeStorageDebugEnabled {
            setupIframeDebugOverlay()
        }
        initWebView()
        if iframeStorageDebugEnabled {
            startIframeDebugPolling()
        }
        initToolbarView()
        loadRootUrl()

        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillHide(_:)), name: UIResponder.keyboardWillHideNotification , object: nil)

    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        GlitchBomb.webView.frame = calcWebviewFrame(webviewView: webviewView, toolbarView: nil)
        layoutLoadingBackgroundEffects()
    }

    @objc func keyboardWillHide(_ notification: NSNotification) {
        GlitchBomb.webView.setNeedsLayout()
    }

    private func setupIframeDebugOverlay() {
        if view.viewWithTag(iframeDebugOverlayTag) != nil { return }

        let label = UILabel(frame: .zero)
        label.tag = iframeDebugOverlayTag
        label.translatesAutoresizingMaskIntoConstraints = false
        label.numberOfLines = 0
        label.textAlignment = .left
        label.font = UIFont.monospacedSystemFont(ofSize: 10, weight: .regular)
        label.backgroundColor = UIColor(red: 0.22, green: 0.03, blue: 0.03, alpha: 0.88)
        label.textColor = UIColor(red: 1.0, green: 0.78, blue: 0.78, alpha: 1.0)
        label.layer.cornerRadius = 8
        label.layer.masksToBounds = true
        label.layer.borderWidth = 1
        label.layer.borderColor = UIColor(red: 0.75, green: 0.25, blue: 0.25, alpha: 1.0).cgColor
        label.text = "Iframe Storage Debug\\nWaiting for web debug stream..."
        label.isUserInteractionEnabled = false

        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 8),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 8),
            label.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -8)
        ])
    }

    private func updateIframeDebugOverlay(text: String) {
        guard let label = view.viewWithTag(iframeDebugOverlayTag) as? UILabel else { return }
        label.text = text
    }

    private func startIframeDebugPolling() {
        iframeDebugPollTimer?.invalidate()
        iframeDebugPollTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            guard let webView = GlitchBomb.webView else { return }

            let js = """
            (() => {
              const state = window.__iframeStorageDebugState;
              const href = window.location ? window.location.href : "-";
              const prefix = "__iframeStorageSnapshot__:";
              if (!state) {
                return [
                  "Iframe Storage Debug (polled)",
                  "status: top debug state missing",
                  "url: " + href
                ].join("\\n");
              }

              const host = state.lastHost || "x.cartridge.gg";
              let keys = 0;
              let bytes = 0;
              try {
                const raw = localStorage.getItem(prefix + host);
                if (raw) {
                  bytes = raw.length;
                  try {
                    const parsed = JSON.parse(raw);
                    keys = parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
                  } catch (_) {}
                }
              } catch (_) {}

              return [
                "Iframe Storage Debug (polled)",
                "url: " + href,
                "activeHost: " + host,
                "stored.keys: " + keys,
                "stored.bytes: " + bytes,
                "sync.count: " + (state.syncCount || 0),
                "request.count: " + (state.requestCount || 0),
                "restore.count: " + (state.restoreCount || 0),
                "iframe.event: " + (state.lastIframeEvent || "-"),
                "iframe.detail: " + (typeof state.lastIframeEventDetail === "string" ? state.lastIframeEventDetail : JSON.stringify(state.lastIframeEventDetail || ""))
              ].join("\\n");
            })();
            """

            webView.evaluateJavaScript(js) { value, error in
                DispatchQueue.main.async {
                    if let text = value as? String {
                        self.updateIframeDebugOverlay(text: text)
                    } else if let error = error {
                        self.updateIframeDebugOverlay(text: "Iframe Storage Debug\\nJS polling error:\\n\\(error.localizedDescription)")
                    }
                }
            }
        }
    }

    func initWebView() {
        GlitchBomb.webView = createWebView(container: webviewView, WKSMH: self, WKND: self)
        webviewView.addSubview(GlitchBomb.webView);
        applyChromeBackgroundColor(loadingTheme.backgroundTop)
        GlitchBomb.webView.isOpaque = false
        GlitchBomb.webView.backgroundColor = .clear
        GlitchBomb.webView.scrollView.backgroundColor = loadingTheme.backgroundTop

        GlitchBomb.webView.uiDelegate = self;

        GlitchBomb.webView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)

        if pullToRefresh {
            #if !targetEnvironment(macCatalyst)
            let refreshControl = UIRefreshControl()
            refreshControl.addTarget(self, action: #selector(refreshWebView(_:)), for: .valueChanged)
            GlitchBomb.webView.scrollView.addSubview(refreshControl)
            GlitchBomb.webView.scrollView.bounces = true
            #endif
        }

        if #available(iOS 15.0, *), adaptiveUIStyle {
            themeObservation = GlitchBomb.webView.observe(\.underPageBackgroundColor) { [unowned self] webView, _ in
                let sampled = webView.underPageBackgroundColor
                self.applyChromeBackgroundColor(sampled ?? self.loadingTheme.backgroundTop)
                self.currentWebViewTheme = (sampled?.isLight() ?? true) ? .light : .dark
                self.overrideUIStyle()
            }
        }

    }

    @objc func refreshWebView(_ sender: UIRefreshControl) {
        GlitchBomb.webView?.reload()
        sender.endRefreshing()
    }

    func createToolbarView() -> UIToolbar{
        let winScene = UIApplication.shared.connectedScenes.first
        let windowScene = winScene as! UIWindowScene
        var statusBarHeight = windowScene.statusBarManager?.statusBarFrame.height ?? 60

        #if targetEnvironment(macCatalyst)
        if (statusBarHeight == 0){
            statusBarHeight = 30
        }
        #endif

        let toolbarView = UIToolbar(frame: CGRect(x: 0, y: 0, width: webviewView.frame.width, height: 0))
        toolbarView.sizeToFit()
        toolbarView.frame = CGRect(x: 0, y: 0, width: webviewView.frame.width, height: toolbarView.frame.height + statusBarHeight)
//        toolbarView.autoresizingMask = [.flexibleTopMargin, .flexibleRightMargin, .flexibleWidth]

        let flex = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let close = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(loadRootUrl))
        toolbarView.setItems([close,flex], animated: true)

        toolbarView.isHidden = true

        return toolbarView
    }

    func overrideUIStyle(toDefault: Bool = false) {
        if #available(iOS 15.0, *), adaptiveUIStyle {
            if (((htmlIsLoaded && !GlitchBomb.webView.isHidden) || toDefault) && self.currentWebViewTheme != .unspecified) {
                UIApplication
                    .shared
                    .connectedScenes
                    .flatMap { ($0 as? UIWindowScene)?.windows ?? [] }
                    .first { $0.isKeyWindow }?.overrideUserInterfaceStyle = toDefault ? .unspecified : self.currentWebViewTheme;
            }
        }
    }

    func initToolbarView() {
        toolbarView =  createToolbarView()

        webviewView.addSubview(toolbarView)
    }

    @objc func loadRootUrl() {
        let launchURL = SceneDelegate.universalLinkToLaunch ?? SceneDelegate.shortcutLinkToLaunch ?? rootUrl
        GlitchBomb.webView.load(URLRequest(url: webViewURL(launchURL)))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!){
        htmlIsLoaded = true

        self.animateConnectionProblem(false)

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            GlitchBomb.webView.isHidden = false
            self.loadingBackgroundView.isHidden = true
            self.loadingView.isHidden = true

            self.overrideUIStyle()
            if iframeStorageDebugEnabled {
                GlitchBomb.webView.evaluateJavaScript("window.__showIframeStorageDebugPanel && window.__showIframeStorageDebugPanel();", completionHandler: nil)
            }
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        htmlIsLoaded = false;

        if (error as NSError)._code != (-999) {
            self.overrideUIStyle(toDefault: true);

            webView.isHidden = true;
            loadingBackgroundView.isHidden = false
            loadingView.isHidden = false;
            animateConnectionProblem(true);

            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    self.loadRootUrl();
                }
            }
        }
    }

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {

        if (keyPath == #keyPath(WKWebView.estimatedProgress) &&
                GlitchBomb.webView.isLoading &&
                !self.loadingView.isHidden &&
                !self.htmlIsLoaded) {
                    var progress = Float(GlitchBomb.webView.estimatedProgress);

                    if (progress >= 0.8) { progress = 1.0; };
                    if (progress >= 0.3) { self.animateConnectionProblem(false); }
        }
    }


    func animateConnectionProblem(_ show: Bool) {
        if (show) {
            self.connectionProblemView.isHidden = false;
            self.connectionProblemView.alpha = 0
            UIView.animate(withDuration: 0.7, delay: 0, options: [.repeat, .autoreverse], animations: {
                self.connectionProblemView.alpha = 1
            })
        }
        else {
            UIView.animate(withDuration: 0.3, delay: 0, options: [], animations: {
                self.connectionProblemView.alpha = 0 // Here you will get the animation you want
            }, completion: { _ in
                self.connectionProblemView.isHidden = true;
                self.connectionProblemView.layer.removeAllAnimations();
            })
        }
    }

    deinit {
        GlitchBomb.webView.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
        iframeDebugPollTimer?.invalidate()
        iframeDebugPollTimer = nil
        NotificationCenter.default.removeObserver(self)
    }
}

private extension ViewController {
    struct LoadingTheme {
        let backgroundTop = UIColor(red: 12.0/255.0, green: 24.0/255.0, blue: 6.0/255.0, alpha: 1) // #0C1806
        let backgroundBottom = UIColor(red: 16.0/255.0, green: 33.0/255.0, blue: 10.0/255.0, alpha: 1)
        let accent = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 1)
        let accentMuted = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 0.25)
        let glitchA = UIColor(red: 255.0/255.0, green: 86.0/255.0, blue: 100.0/255.0, alpha: 0.9)
        let glitchB = UIColor(red: 76.0/255.0, green: 162.0/255.0, blue: 255.0/255.0, alpha: 0.9)
        let glow = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 0.9)
    }

    func setupLoadingScreen() {
        setupLoadingBackground()
        setupLogoEffects()
        setupLoadingStatusLabel()
        startLoadingAnimations()
    }

    func setupLoadingBackground() {
        loadingBackgroundView.backgroundColor = loadingTheme.backgroundTop

        let gradient = CAGradientLayer()
        gradient.colors = [loadingTheme.backgroundTop.cgColor, loadingTheme.backgroundBottom.cgColor]
        gradient.startPoint = CGPoint(x: 0.1, y: 0.0)
        gradient.endPoint = CGPoint(x: 0.9, y: 1.0)
        gradient.frame = loadingBackgroundView.bounds
        loadingBackgroundView.layer.insertSublayer(gradient, at: 0)
        loadingGradientLayer = gradient

        let accent = CAGradientLayer()
        accent.type = .radial
        accent.colors = [
            loadingTheme.accent.withAlphaComponent(0.24).cgColor,
            loadingTheme.accent.withAlphaComponent(0.12).cgColor,
            UIColor.clear.cgColor
        ]
        accent.locations = [0.0, 0.28, 1.0]
        loadingBackgroundView.layer.insertSublayer(accent, above: gradient)
        loadingAccentLayer = accent

        let scanlineReplicator = CAReplicatorLayer()
        scanlineReplicator.instanceTransform = CATransform3DMakeTranslation(0, 4, 0)
        let scanline = CALayer()
        scanline.backgroundColor = UIColor.white.withAlphaComponent(0.045).cgColor
        scanlineReplicator.addSublayer(scanline)
        loadingBackgroundView.layer.insertSublayer(scanlineReplicator, above: accent)
        scanlineReplicatorLayer = scanlineReplicator
        scanlineSeedLayer = scanline

        layoutLoadingBackgroundEffects()
    }

    func setupLogoEffects() {
        loadingView.clipsToBounds = false

        logoImageView.layer.shadowColor = loadingTheme.glow.cgColor
        logoImageView.layer.shadowRadius = 18
        logoImageView.layer.shadowOpacity = 0.55
        logoImageView.layer.shadowOffset = .zero

        createGlitchOverlays()
    }

    func applyChromeBackgroundColor(_ color: UIColor) {
        view.backgroundColor = color
        webviewView.backgroundColor = color
        GlitchBomb.webView?.scrollView.backgroundColor = color

        if let toolbarView = toolbarView {
            if #available(iOS 15.0, *) {
                let appearance = UIToolbarAppearance()
                appearance.configureWithOpaqueBackground()
                appearance.backgroundColor = color
                toolbarView.standardAppearance = appearance
                toolbarView.scrollEdgeAppearance = appearance
            } else {
                toolbarView.barTintColor = color
            }
        }
    }

    func createGlitchOverlays() {
        guard glitchLayers.isEmpty, let baseImage = logoImageView.image else { return }

        let glitchColors = [loadingTheme.glitchA, loadingTheme.glitchB]
        for color in glitchColors {
            let image = baseImage.withRenderingMode(.alwaysTemplate)
            let layerView = UIImageView(image: image)
            layerView.translatesAutoresizingMaskIntoConstraints = false
            layerView.contentMode = logoImageView.contentMode
            layerView.tintColor = color
            layerView.alpha = 0

            loadingView.addSubview(layerView)
            NSLayoutConstraint.activate([
                layerView.centerXAnchor.constraint(equalTo: logoImageView.centerXAnchor),
                layerView.centerYAnchor.constraint(equalTo: logoImageView.centerYAnchor),
                layerView.widthAnchor.constraint(equalTo: logoImageView.widthAnchor),
                layerView.heightAnchor.constraint(equalTo: logoImageView.heightAnchor)
            ])
            glitchLayers.append(layerView)
        }
    }

    func setupLoadingStatusLabel() {
        guard loadingStatusLabel == nil else { return }

        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.numberOfLines = 1
        label.textColor = loadingTheme.accent
        label.font = UIFont.monospacedSystemFont(ofSize: 11, weight: .semibold)
        label.attributedText = NSAttributedString(
            string: "CONNECTING",
            attributes: [.kern: 3.0]
        )
        label.alpha = 0.82

        loadingView.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor),
            label.topAnchor.constraint(equalTo: logoImageView.bottomAnchor, constant: 26),
            label.leadingAnchor.constraint(greaterThanOrEqualTo: loadingView.leadingAnchor, constant: 12),
            label.trailingAnchor.constraint(lessThanOrEqualTo: loadingView.trailingAnchor, constant: -12)
        ])

        loadingStatusLabel = label
    }

    func startLoadingAnimations() {
        loadingView.layer.removeAllAnimations()
        logoImageView.layer.removeAllAnimations()
        loadingAccentLayer?.removeAllAnimations()
        scanlineSeedLayer?.removeAllAnimations()
        loadingStatusLabel?.layer.removeAllAnimations()

        for layerView in glitchLayers {
            layerView.layer.removeAllAnimations()
        }

        let float = CAKeyframeAnimation(keyPath: "transform.translation.y")
        float.values = [0, -4, 0, 2, 0]
        float.keyTimes = [0, 0.25, 0.55, 0.8, 1]
        float.duration = 4.2
        float.repeatCount = .infinity
        float.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        loadingView.layer.add(float, forKey: "float")

        let breathe = CABasicAnimation(keyPath: "transform.scale")
        breathe.fromValue = 0.98
        breathe.toValue = 1.02
        breathe.duration = 3.2
        breathe.autoreverses = true
        breathe.repeatCount = .infinity
        breathe.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        logoImageView.layer.add(breathe, forKey: "breathe")

        addLogoShiftAnimation()
        addLogoGlowAnimation()
        addAccentPulseAnimation()
        addScanlineDriftAnimation()
        addStatusFlickerAnimation()

        for (index, layerView) in glitchLayers.enumerated() {
            addGlitchAnimation(to: layerView, variant: index)
        }
    }

    func layoutLoadingBackgroundEffects() {
        loadingGradientLayer?.frame = loadingBackgroundView.bounds

        if let accent = loadingAccentLayer {
            let bounds = loadingBackgroundView.bounds
            accent.frame = CGRect(
                x: -bounds.width * 0.2,
                y: -bounds.height * 0.22,
                width: bounds.width * 1.4,
                height: bounds.height * 1.4
            )
        }

        if let scanlineReplicatorLayer, let scanlineSeedLayer {
            scanlineReplicatorLayer.frame = loadingBackgroundView.bounds
            scanlineReplicatorLayer.instanceCount = max(Int(ceil(loadingBackgroundView.bounds.height / 4.0)), 1)
            scanlineSeedLayer.frame = CGRect(x: 0, y: 0, width: loadingBackgroundView.bounds.width, height: 1)
        }
    }

    func addLogoShiftAnimation() {
        let keyTimes = glitchBurstKeyTimes()

        let shiftX = CAKeyframeAnimation(keyPath: "transform.translation.x")
        shiftX.values = [0, 3, -3, 2, 0, 0, -2, 3, -1, 0, 0, 2, -3, 1, 0, 0]
        shiftX.keyTimes = keyTimes
        shiftX.duration = glitchCycleDuration
        shiftX.repeatCount = .infinity
        shiftX.timingFunction = CAMediaTimingFunction(name: .linear)

        let shiftY = CAKeyframeAnimation(keyPath: "transform.translation.y")
        shiftY.values = [0, -1, 1, 2, 0, 0, -1, 1, -2, 0, 0, 1, -1, 2, 0, 0]
        shiftY.keyTimes = keyTimes
        shiftY.duration = glitchCycleDuration
        shiftY.repeatCount = .infinity
        shiftY.timingFunction = CAMediaTimingFunction(name: .linear)

        logoImageView.layer.add(shiftX, forKey: "glitch-shift-x")
        logoImageView.layer.add(shiftY, forKey: "glitch-shift-y")
    }

    func addLogoGlowAnimation() {
        let keyTimes = glitchBurstKeyTimes()

        let glow = CAKeyframeAnimation(keyPath: "shadowOpacity")
        glow.values = [0.35, 0.78, 0.62, 0.72, 0.35, 0.35, 0.8, 0.58, 0.7, 0.35, 0.35, 0.76, 0.56, 0.7, 0.35, 0.35]
        glow.keyTimes = keyTimes
        glow.duration = glitchCycleDuration
        glow.repeatCount = .infinity
        glow.timingFunction = CAMediaTimingFunction(name: .linear)

        let radius = CAKeyframeAnimation(keyPath: "shadowRadius")
        radius.values = [16, 22, 19, 21, 16, 16, 23, 18, 20, 16, 16, 22, 18, 20, 16, 16]
        radius.keyTimes = keyTimes
        radius.duration = glitchCycleDuration
        radius.repeatCount = .infinity
        radius.timingFunction = CAMediaTimingFunction(name: .linear)

        logoImageView.layer.add(glow, forKey: "glow-opacity")
        logoImageView.layer.add(radius, forKey: "glow-radius")
    }

    func addAccentPulseAnimation() {
        guard let loadingAccentLayer else { return }

        let pulse = CABasicAnimation(keyPath: "opacity")
        pulse.fromValue = 0.42
        pulse.toValue = 0.78
        pulse.duration = glitchCycleDuration
        pulse.autoreverses = true
        pulse.repeatCount = .infinity
        pulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        loadingAccentLayer.add(pulse, forKey: "accent-opacity")
    }

    func addScanlineDriftAnimation() {
        guard let scanlineSeedLayer else { return }

        let drift = CABasicAnimation(keyPath: "transform.translation.y")
        drift.fromValue = 0
        drift.toValue = 4
        drift.duration = 0.24
        drift.repeatCount = .infinity
        drift.timingFunction = CAMediaTimingFunction(name: .linear)
        scanlineSeedLayer.add(drift, forKey: "scanline-drift")
    }

    func addStatusFlickerAnimation() {
        guard let loadingStatusLabel else { return }

        let keyTimes = glitchBurstKeyTimes()

        let opacity = CAKeyframeAnimation(keyPath: "opacity")
        opacity.values = [0.78, 1.0, 0.9, 1.0, 0.78, 0.78, 1.0, 0.88, 1.0, 0.78, 0.78, 1.0, 0.88, 1.0, 0.78, 0.78]
        opacity.keyTimes = keyTimes
        opacity.duration = glitchCycleDuration
        opacity.repeatCount = .infinity
        opacity.timingFunction = CAMediaTimingFunction(name: .linear)

        let shift = CAKeyframeAnimation(keyPath: "transform.translation.x")
        shift.values = [0, -1, 1, -1, 0, 0, 1, -1, 1, 0, 0, -1, 1, -1, 0, 0]
        shift.keyTimes = keyTimes
        shift.duration = glitchCycleDuration
        shift.repeatCount = .infinity
        shift.timingFunction = CAMediaTimingFunction(name: .linear)

        loadingStatusLabel.layer.add(opacity, forKey: "status-opacity")
        loadingStatusLabel.layer.add(shift, forKey: "status-shift")
    }

    func addGlitchAnimation(to imageView: UIImageView, variant: Int) {
        let keyTimes: [NSNumber] = [
            0, 0.02, 0.03, 0.04, 0.06, 0.08,
            0.30, 0.32, 0.33, 0.34, 0.36, 0.38,
            0.68, 0.70, 0.71, 0.72, 0.74, 0.76,
            1
        ]

        let shiftX = CAKeyframeAnimation(keyPath: "transform.translation.x")
        let shiftY = CAKeyframeAnimation(keyPath: "transform.translation.y")
        let opacity = CAKeyframeAnimation(keyPath: "opacity")

        if variant == 0 {
            shiftX.values = [0, -4, 3, -3, 3, 0, 0, 4, -3, 3, -4, 0, 0, -3, 4, -4, 3, 0, 0]
            shiftY.values = [0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0, -1, 0, 0]
        } else {
            shiftX.values = [0, 4, -3, 3, -4, 0, 0, -4, 3, -3, 4, 0, 0, 3, -3, 4, -4, 0, 0]
            shiftY.values = [0, 0, 0, -1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 1, 0, 0]
        }

        opacity.values = [0, 0.95, 0.68, 0.9, 0.82, 0, 0, 0.95, 0.68, 0.9, 0.82, 0, 0, 0.95, 0.68, 0.9, 0.82, 0, 0]

        shiftX.keyTimes = keyTimes
        shiftY.keyTimes = keyTimes
        opacity.keyTimes = keyTimes

        shiftX.duration = glitchCycleDuration
        shiftY.duration = glitchCycleDuration
        opacity.duration = glitchCycleDuration

        shiftX.repeatCount = .infinity
        shiftY.repeatCount = .infinity
        opacity.repeatCount = .infinity

        shiftX.timingFunction = CAMediaTimingFunction(name: .linear)
        shiftY.timingFunction = CAMediaTimingFunction(name: .linear)
        opacity.timingFunction = CAMediaTimingFunction(name: .linear)

        let group = CAAnimationGroup()
        group.animations = [shiftX, shiftY, opacity]
        group.duration = glitchCycleDuration
        group.repeatCount = .infinity
        group.timingFunction = CAMediaTimingFunction(name: .linear)
        imageView.layer.add(group, forKey: "glitch")
    }

    func glitchBurstKeyTimes() -> [NSNumber] {
        [0, 0.02, 0.04, 0.06, 0.08, 0.30, 0.32, 0.34, 0.36, 0.38, 0.68, 0.70, 0.72, 0.74, 0.76, 1]
    }
}

extension UIColor {
    // Check if the color is light or dark, as defined by the injected lightness threshold.
    // Some people report that 0.7 is best. I suggest to find out for yourself.
    // A nil value is returned if the lightness couldn't be determined.
    func isLight(threshold: Float = 0.5) -> Bool? {
        let originalCGColor = self.cgColor

        // Now we need to convert it to the RGB colorspace. UIColor.white / UIColor.black are greyscale and not RGB.
        // If you don't do this then you will crash when accessing components index 2 below when evaluating greyscale colors.
        let RGBCGColor = originalCGColor.converted(to: CGColorSpaceCreateDeviceRGB(), intent: .defaultIntent, options: nil)
        guard let components = RGBCGColor?.components else {
            return nil
        }
        guard components.count >= 3 else {
            return nil
        }

        let brightness = Float(((components[0] * 299) + (components[1] * 587) + (components[2] * 114)) / 1000)
        return (brightness > threshold)
    }
}

extension ViewController: WKScriptMessageHandler {
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "print" {
            printView(webView: GlitchBomb.webView)
        }
        if iframeStorageDebugEnabled && message.name == "iframe-storage-debug-native" {
            if let body = message.body as? [String: Any], let text = body["text"] as? String {
                DispatchQueue.main.async {
                    self.updateIframeDebugOverlay(text: text)
                }
            }
        }
        if message.name == "push-subscribe" {
            handleSubscribeTouch(message: message)
        }
        if message.name == "push-permission-request" {
            handlePushPermission()
        }
        if message.name == "push-permission-state" {
            handlePushState()
        }
        if message.name == "push-token" {
            handleFCMToken()
        }
        if message.name == "cartridge-logout-cleanup" {
            clearCartridgeWebsiteData()
        }
  }
}
