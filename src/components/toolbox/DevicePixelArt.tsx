import type { DeviceKind } from '../../content/toolbox'

function MacBookArt() {
  return (
    <>
      <rect className="pixel-shadow" x="69" y="24" width="188" height="132" />
      <rect className="pixel-metal" x="65" y="18" width="188" height="132" />
      <rect className="pixel-screen" x="72" y="25" width="174" height="118" />
      <rect className="pixel-bright" x="158" y="21" width="3" height="2" />
      <rect className="pixel-dim" x="84" y="39" width="50" height="4" />
      <rect className="pixel-dim" x="84" y="49" width="78" height="4" />
      <rect className="pixel-bright" x="84" y="65" width="20" height="4" />
      <rect className="pixel-dim" x="110" y="65" width="74" height="4" />
      <rect className="pixel-dim" x="84" y="75" width="102" height="4" />
      <rect className="pixel-bright" x="84" y="91" width="30" height="4" />
      <rect className="pixel-dim" x="120" y="91" width="64" height="4" />
      <rect className="pixel-dim" x="84" y="101" width="88" height="4" />
      <rect className="pixel-bright" x="84" y="117" width="5" height="9" />
      <rect className="pixel-metal" x="57" y="150" width="206" height="6" />
      <rect className="pixel-metal" x="37" y="156" width="246" height="8" />
      <rect className="pixel-shadow" x="44" y="164" width="232" height="8" />
      <rect className="pixel-dim" x="137" y="157" width="46" height="4" />
      <rect className="pixel-bright" x="139" y="164" width="42" height="2" />
    </>
  )
}

function DesktopArt() {
  return (
    <>
      <rect className="pixel-shadow" x="26" y="41" width="188" height="116" />
      <rect className="pixel-metal" x="20" y="35" width="188" height="116" />
      <rect className="pixel-screen" x="27" y="42" width="174" height="102" />
      <rect className="pixel-dim" x="39" y="54" width="78" height="5" />
      <rect className="pixel-bright" x="39" y="68" width="45" height="5" />
      <rect className="pixel-dim" x="39" y="82" width="118" height="5" />
      <rect className="pixel-dim" x="39" y="96" width="91" height="5" />
      <rect className="pixel-bright" x="145" y="109" width="10" height="10" />
      <rect className="pixel-dim" x="157" y="97" width="10" height="10" />
      <rect className="pixel-dim" x="169" y="85" width="10" height="10" />
      <rect className="pixel-metal" x="100" y="151" width="28" height="18" />
      <rect className="pixel-metal" x="78" y="169" width="72" height="7" />
      <rect className="pixel-shadow" x="85" y="176" width="58" height="4" />
      <rect className="pixel-shadow" x="236" y="31" width="62" height="154" />
      <rect className="pixel-metal" x="230" y="25" width="62" height="154" />
      <rect className="pixel-screen" x="237" y="33" width="48" height="138" />
      <rect className="pixel-bright" x="246" y="42" width="30" height="4" />
      <rect className="pixel-dim" x="246" y="58" width="28" height="28" />
      <rect className="pixel-screen" x="252" y="64" width="16" height="16" />
      <rect className="pixel-dim" x="246" y="96" width="28" height="28" />
      <rect className="pixel-screen" x="252" y="102" width="16" height="16" />
      <rect className="pixel-dim" x="246" y="135" width="30" height="4" />
      <rect className="pixel-bright" x="246" y="149" width="5" height="5" />
    </>
  )
}

function ServerArt() {
  return (
    <>
      <rect className="pixel-shadow" x="58" y="34" width="210" height="125" />
      <rect className="pixel-metal" x="52" y="28" width="210" height="125" />
      <rect className="pixel-screen" x="60" y="36" width="194" height="109" />
      <rect className="pixel-dim" x="76" y="52" width="130" height="6" />
      <rect className="pixel-bright" x="76" y="68" width="9" height="9" />
      <rect className="pixel-dim" x="94" y="69" width="77" height="5" />
      <rect className="pixel-bright" x="76" y="87" width="9" height="9" />
      <rect className="pixel-dim" x="94" y="88" width="111" height="5" />
      <rect className="pixel-bright" x="76" y="106" width="9" height="9" />
      <rect className="pixel-dim" x="94" y="107" width="91" height="5" />
      <rect className="pixel-dim" x="76" y="128" width="37" height="5" />
      <rect className="pixel-bright" x="118" y="128" width="5" height="5" />
      <rect className="pixel-metal" x="65" y="153" width="190" height="6" />
      <rect className="pixel-metal" x="33" y="159" width="254" height="10" />
      <rect className="pixel-shadow" x="42" y="169" width="236" height="7" />
      <rect className="pixel-dim" x="145" y="160" width="30" height="3" />
    </>
  )
}

export function DevicePixelArt({ kind }: { kind: DeviceKind }) {
  return (
    <svg className="device-pixel-art" viewBox="0 0 320 208" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {kind === 'macbook' ? <MacBookArt /> : kind === 'desktop' ? <DesktopArt /> : <ServerArt />}
    </svg>
  )
}
