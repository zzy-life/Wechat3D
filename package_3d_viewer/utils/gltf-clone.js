/*
 * @Author: 时不待我 790002517@qq.com
 * @Date: 2023-02-28 14:07:46
 * @LastEditors: 时不待我 790002517@qq.com
 * @LastEditTime: 2023-03-01 12:50:05
 */
export default function(gltf, THREE) {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true)
    }
  
    const skinnedMeshes = {}
    gltf.scene.traverse(node => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node
      }
      if (node.isMesh) {
        //开启阴影
        node.castShadow = true;
        node.receiveShadow = true;
    }
    })
  
    const cloneBones = {}
    const cloneSkinnedMeshes = {}
  
    clone.scene.traverse(node => {
      if (node.isBone) {
        cloneBones[node.name] = node
      }
  
      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node
      }
    })
  
    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name]
      const skeleton = skinnedMesh.skeleton
      const cloneSkinnedMesh = cloneSkinnedMeshes[name]
  
      const orderedCloneBones = []
  
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }
  
      cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses), cloneSkinnedMesh.matrixWorld)
    }
  
    return clone
  }