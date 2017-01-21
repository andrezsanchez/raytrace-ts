import Vector3 from './Vector3';

interface ShaderInterface {
  (uvw : Vector3, c : Vector3) : void;
};

export default ShaderInterface;
