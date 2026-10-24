/**
 * The Tamagui style-prop surface: every prop name that applies styling
 * when set on an element. This is the list the no-page-styling rule
 * (./noPageStyling.mjs) bans inside src/pages/** (#119).
 *
 * Derivation: the keys of `stylePropsAll` from @tamagui/helpers 3.0.18
 * (the same table Tamagui's own runtime splits style props with), so
 * the list tracks Tamagui instead of being hand-curated. Two deliberate
 * adjustments:
 *
 * - Removed the SVG shape-geometry attributes `d`, `cx`, `cy`, `r`,
 *   `rx`, `ry`: those describe a shape's geometry, not its styling,
 *   and flagging them would ban data, not styling. (SVG paint props
 *   like `fill` and `stroke` stay — they ARE styling.)
 * - Added Tamagui's pseudo/enter/exit style props (`hoverStyle`,
 *   `pressStyle`, `focusStyle`, `focusVisibleStyle`, `disabledStyle`,
 *   `enterStyle`, `exitStyle`), which Tamagui handles outside
 *   `stylePropsAll` but which are unambiguously styling.
 *
 * Media and variant props (`$gtSm`, `$platform-web`, `$theme-dark`,
 * ...) are NOT listed here: the rule bans any `$`-prefixed prop by
 * prefix instead.
 *
 * To regenerate after a Tamagui bump: read `stylePropsAll` from
 * @tamagui/helpers, apply the two adjustments above, re-chunk.
 */
const STYLE_PROP_NAMES = [
  "KhtmlBoxAlign KhtmlBoxDirection KhtmlBoxFlex KhtmlBoxFlexGroup KhtmlBoxLines",
  "KhtmlBoxOrdinalGroup KhtmlBoxOrient KhtmlBoxPack KhtmlLineBreak KhtmlOpacity KhtmlUserSelect",
  "OAnimation OAnimationDelay OAnimationDirection OAnimationDuration OAnimationFillMode",
  "OAnimationIterationCount OAnimationName OAnimationPlayState OAnimationTimingFunction",
  "OBackgroundSize OBorderImage OObjectFit OObjectPosition OTabSize OTextOverflow OTransform",
  "OTransformOrigin OTransition OTransitionDelay OTransitionDuration OTransitionProperty",
  "OTransitionTimingFunction WebkitBackdropFilter WebkitBoxOrient WebkitLineClamp accentColor",
  "alignContent alignItems alignSelf alignTracks alignmentBaseline all anchorName anchorScope",
  "animation animationComposition animationDelay animationDirection animationDuration",
  "animationFillMode animationIterationCount animationName animationPlayState animationRange",
  "animationRangeEnd animationRangeStart animationTimeline animationTimingFunction appearance",
  "aspectRatio backdropFilter backfaceVisibility background backgroundAttachment",
  "backgroundBlendMode backgroundClip backgroundColor backgroundImage backgroundOrigin",
  "backgroundPosition backgroundPositionX backgroundPositionY backgroundRepeat backgroundSize",
  "baselineShift blockSize border borderBlock borderBlockColor borderBlockEnd",
  "borderBlockEndColor borderBlockEndStyle borderBlockEndWidth borderBlockStart",
  "borderBlockStartColor borderBlockStartStyle borderBlockStartWidth borderBlockStyle",
  "borderBlockWidth borderBottom borderBottomColor borderBottomEndRadius borderBottomLeftRadius",
  "borderBottomRightRadius borderBottomStartRadius borderBottomStyle borderBottomWidth",
  "borderCollapse borderColor borderCurve borderEndColor borderEndEndRadius",
  "borderEndStartRadius borderEndWidth borderImage borderImageOutset borderImageRepeat",
  "borderImageSlice borderImageSource borderImageWidth borderInline borderInlineColor",
  "borderInlineEnd borderInlineEndColor borderInlineEndStyle borderInlineEndWidth",
  "borderInlineStart borderInlineStartColor borderInlineStartStyle borderInlineStartWidth",
  "borderInlineStyle borderInlineWidth borderLeft borderLeftColor borderLeftStyle",
  "borderLeftWidth borderRadius borderRight borderRightColor borderRightStyle borderRightWidth",
  "borderSpacing borderStartColor borderStartEndRadius borderStartStartRadius borderStartWidth",
  "borderStyle borderTop borderTopColor borderTopEndRadius borderTopLeftRadius",
  "borderTopRightRadius borderTopStartRadius borderTopStyle borderTopWidth borderWidth bottom",
  "boxAlign boxDecorationBreak boxDirection boxFlex boxFlexGroup boxLines boxOrdinalGroup",
  "boxOrient boxPack boxShadow boxSizing breakAfter breakBefore breakInside captionSide caret",
  "caretColor caretShape clear clip clipPath clipRule color colorAdjust colorInterpolation",
  "colorInterpolationFilters colorRendering colorScheme columnCount columnFill columnGap",
  "columnRule columnRuleColor columnRuleStyle columnRuleWidth columnSpan columnWidth columns",
  "contain containIntrinsicBlockSize containIntrinsicHeight containIntrinsicInlineSize",
  "containIntrinsicSize containIntrinsicWidth container containerName containerType content",
  "contentVisibility counterIncrement counterReset counterSet cursor cursorColor direction",
  "disabledStyle display dominantBaseline emptyCells end enterStyle exitStyle",
  "experimental_backgroundImage fieldSizing fill fillOpacity fillRule filter flex flexBasis",
  "flexDirection flexFlow flexGrow flexNegative flexOrder flexPositive flexShrink flexWrap",
  "float floodColor floodOpacity focusStyle focusVisibleStyle font fontFamily",
  "fontFeatureSettings fontKerning fontLanguageOverride fontOpticalSizing fontPalette fontSize",
  "fontSizeAdjust fontSmooth fontStretch fontStyle fontSynthesis fontSynthesisPosition",
  "fontSynthesisSmallCaps fontSynthesisStyle fontSynthesisWeight fontVariant",
  "fontVariantAlternates fontVariantCaps fontVariantEastAsian fontVariantEmoji",
  "fontVariantLigatures fontVariantNumeric fontVariantPosition fontVariationSettings fontWeight",
  "fontWidth forcedColorAdjust gap glyphOrientationVertical grid gridArea gridAutoColumns",
  "gridAutoFlow gridAutoRows gridColumn gridColumnEnd gridColumnGap gridColumnStart gridGap",
  "gridRow gridRowEnd gridRowGap gridRowStart gridTemplate gridTemplateAreas",
  "gridTemplateColumns gridTemplateRows hangingPunctuation height hoverStyle hyphenateCharacter",
  "hyphenateLimitChars hyphens imageOrientation imageRendering imageResolution imeMode",
  "initialLetter initialLetterAlign inlineSize inset insetArea insetBlock insetBlockEnd",
  "insetBlockStart insetInline insetInlineEnd insetInlineStart interpolateSize isolation",
  "justifyContent justifyItems justifySelf justifyTracks left letterSpacing lightingColor",
  "lineBreak lineClamp lineHeight lineHeightStep listStyle listStyleImage listStylePosition",
  "listStyleType margin marginBlock marginBlockEnd marginBlockStart marginBottom marginEnd",
  "marginHorizontal marginInline marginInlineEnd marginInlineStart marginLeft marginRight",
  "marginStart marginTop marginTrim marginVertical marker markerEnd markerMid markerStart mask",
  "maskBorder maskBorderMode maskBorderOutset maskBorderRepeat maskBorderSlice maskBorderSource",
  "maskBorderWidth maskClip maskComposite maskImage maskMode maskOrigin maskPosition maskRepeat",
  "maskSize maskType masonryAutoFlow mathDepth mathShift mathStyle matrix maxBlockSize",
  "maxHeight maxInlineSize maxLines maxWidth minBlockSize minHeight minInlineSize minWidth",
  "mixBlendMode motion motionDistance motionPath motionRotation objectFit objectPosition",
  "objectViewBox offset offsetAnchor offsetBlock offsetBlockEnd offsetBlockStart offsetDistance",
  "offsetInline offsetInlineEnd offsetInlineStart offsetPath offsetPosition offsetRotate",
  "offsetRotation opacity order orphans outline outlineColor outlineOffset outlineStyle",
  "outlineWidth overflow overflowAnchor overflowBlock overflowClipBox overflowClipMargin",
  "overflowInline overflowWrap overflowX overflowY overlay overscrollBehavior",
  "overscrollBehaviorBlock overscrollBehaviorInline overscrollBehaviorX overscrollBehaviorY",
  "padding paddingBlock paddingBlockEnd paddingBlockStart paddingBottom paddingEnd",
  "paddingHorizontal paddingInline paddingInlineEnd paddingInlineStart paddingLeft paddingRight",
  "paddingStart paddingTop paddingVertical page pageBreakAfter pageBreakBefore pageBreakInside",
  "paintOrder perspective perspectiveOrigin placeContent placeItems placeSelf",
  "placeholderTextColor pointerEvents position positionAnchor positionArea positionTry",
  "positionTryFallbacks positionTryOptions positionTryOrder positionVisibility pressStyle",
  "printColorAdjust quotes resize right rotate rotateX rotateY rotateZ rowGap rubyAlign",
  "rubyMerge rubyOverhang rubyPosition scale scaleX scaleY scaleZ scrollBehavior",
  "scrollInitialTarget scrollMargin scrollMarginBlock scrollMarginBlockEnd",
  "scrollMarginBlockStart scrollMarginBottom scrollMarginInline scrollMarginInlineEnd",
  "scrollMarginInlineStart scrollMarginLeft scrollMarginRight scrollMarginTop scrollPadding",
  "scrollPaddingBlock scrollPaddingBlockEnd scrollPaddingBlockStart scrollPaddingBottom",
  "scrollPaddingInline scrollPaddingInlineEnd scrollPaddingInlineStart scrollPaddingLeft",
  "scrollPaddingRight scrollPaddingTop scrollSnapAlign scrollSnapCoordinate",
  "scrollSnapDestination scrollSnapMargin scrollSnapMarginBottom scrollSnapMarginLeft",
  "scrollSnapMarginRight scrollSnapMarginTop scrollSnapPointsX scrollSnapPointsY scrollSnapStop",
  "scrollSnapType scrollSnapTypeX scrollSnapTypeY scrollTimeline scrollTimelineAxis",
  "scrollTimelineName scrollbarColor scrollbarGutter scrollbarWidth selectionColor",
  "selectionHandleColor shadowColor shadowOffset shadowOpacity shadowRadius shapeImageThreshold",
  "shapeMargin shapeOutside shapeRendering skewX skewY speakAs start stopColor stopOpacity",
  "stroke strokeColor strokeDasharray strokeDashoffset strokeLinecap strokeLinejoin",
  "strokeMiterlimit strokeOpacity strokeWidth tabSize tableLayout textAlign textAlignLast",
  "textAnchor textAutospace textBox textBoxEdge textBoxTrim textCombineUpright textDecoration",
  "textDecorationColor textDecorationDistance textDecorationLine textDecorationSkip",
  "textDecorationSkipInk textDecorationStyle textDecorationThickness textEmphasis",
  "textEmphasisColor textEmphasisPosition textEmphasisStyle textIndent textJustify",
  "textOrientation textOverflow textRendering textShadow textShadowColor textShadowOffset",
  "textShadowRadius textSizeAdjust textSpacingTrim textTransform textUnderlineOffset",
  "textUnderlinePosition textWrap textWrapMode textWrapStyle timelineScope top touchAction",
  "transform transformBox transformOrigin transformStyle transition transitionBehavior",
  "transitionDelay transitionDuration transitionProperty transitionTimingFunction translate",
  "unicodeBidi userSelect vectorEffect verticalAlign viewTimeline viewTimelineAxis",
  "viewTimelineInset viewTimelineName viewTransitionClass viewTransitionName visibility",
  "whiteSpace whiteSpaceCollapse widows width willChange wordBreak wordSpacing wordWrap",
  "writingDirection writingMode x y zIndex zoom",
]
  .join(" ")
  .split(" ");

export const styleProps = new Set(STYLE_PROP_NAMES);
